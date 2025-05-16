import { and, eq } from "drizzle-orm";
import Fuse from "fuse.js";
import * as semver from "semver";
import { z } from "zod";
import type { Database } from "~/db";
import * as schema from "~/db/schema";
import { Markdown } from "~/utils/markdown";
import type { UUID } from "~/utils/uuid";
import { assertUUID } from "~/utils/uuid";
import type { BaseMeta } from "./post.server";
import { Post } from "./post.server";

interface TutorialMeta extends BaseMeta {
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	tags?: string | string[];
}

type InsertTutorial = Omit<schema.InsertPost, "id" | "type"> & TutorialMeta;

interface Services {
	db: Database;
}

// @ts-expect-error TS is an idiot
export class Tutorial extends Post<TutorialMeta> {
	override readonly type = "tutorial" as const;

	get title() {
		return this.meta.title;
	}

	get slug() {
		return this.meta.slug;
	}

	get excerpt() {
		return this.meta.excerpt;
	}

	get content() {
		return this.meta.content;
	}

	get tags() {
		if (typeof this.meta.tags === "string") return [this.meta.tags];
		return this.meta.tags ?? [];
	}

	get pathname() {
		return `/tutorials/${this.slug}`;
	}

	get renderable() {
		return Markdown.parse(this.content);
	}

	get wordCount() {
		let titleLength = this.title.split(/\s+/).length;
		return Markdown.plain(this.content).split(/\s+/).length + titleLength;
	}

	override toJSON() {
		return {
			...super.toJSON(),
			title: this.title,
			slug: this.slug,
			excerpt: this.excerpt,
			content: this.content,
			tags: this.tags,
		};
	}

	async recommendations(services: Services, limit = 3) {
		let list = await Tutorial.list(services);

		list = list.filter((item) => !item.slug.includes(this.slug));

		let result: Tutorial[] = [];

		for (let item of list) {
			for (let tag of Tutorial.shuffle(this.tags)) {
				let { name, version } = Tutorial.getPackageNameAndVersion(tag);

				let match = Tutorial.shuffle(item.tags).find((itemTag) => {
					let item = Tutorial.getPackageNameAndVersion(itemTag);
					if (item.name !== name) return false;
					return semver.gte(version, item.version);
				});

				if (match) result.push(item);
			}
		}

		return Tutorial.shuffle(Tutorial.dedupeBySlug(result)).slice(0, limit);
	}

	static override async list(services: Services) {
		let posts = await Post.list<TutorialMeta>(services, "tutorial");
		return posts.map((post) => new Tutorial(services, post));
	}

	static async search(services: Services, searchQuery = "") {
		let tutorials = await Tutorial.list(services);

		let query = searchQuery?.toLowerCase().trim(); // Normalize the query

		let techsInQuery = Tutorial.findTechnologiesInString(query);

		for (let techInQuery of techsInQuery) {
			if (techInQuery.version) {
				query = query.replace(
					`tech:${techInQuery.name}@${techInQuery.version}`,
					"",
				);
			} else {
				query = query.replace(`tech:${techInQuery.name}`, "");
			}

			tutorials = tutorials.filter((item) => {
				for (let tagInTutorial of item.tags) {
					let techInTutorial = Tutorial.getPackageNameAndVersion(tagInTutorial);
					if (techInQuery.name.includes("*")) {
						if (
							!techInTutorial.name.includes(techInQuery.name.replace("*", ""))
						) {
							continue;
						}
					} else if (techInTutorial.name !== techInQuery.name) {
						continue;
					}
					if (!techInQuery.version) return true;
					if (semver.gte(techInTutorial.version, techInQuery.version)) {
						return true;
					}
				}

				return false;
			});
		}

		let fuse = new Fuse(tutorials, {
			keys: ["title", "content"],
			includeScore: true,
			findAllMatches: false,
			useExtendedSearch: true,
		});

		return fuse.search(query);
	}

	static async findById(services: Services, id: UUID) {
		let post = await Post.show<TutorialMeta>(services, "tutorial", id);
		return new Tutorial(services, post);
	}

	static override async show(
		services: Services,
		slug: schema.SelectPostMeta["value"],
	) {
		let result = await services.db.query.postMeta.findFirst({
			columns: { postId: true },
			where: and(
				eq(schema.postMeta.key, "slug"),
				eq(schema.postMeta.value, slug),
			),
		});

		assertUUID(result?.postId);

		let post = await Post.show<TutorialMeta>(
			services,
			"tutorial",
			result.postId,
		);

		return new Tutorial(services, post);
	}

	static override async create(services: Services, input: InsertTutorial) {
		let post = await Post.create<TutorialMeta>(services, {
			...input,
			type: "tutorial",
		});

		return new Tutorial(services, post);
	}

	static override update(services: Services, id: UUID, input: InsertTutorial) {
		return Post.update<TutorialMeta>(services, id, {
			...input,
			type: "tutorial",
		});
	}

	private static shuffle<Value>(list: Value[]) {
		let result = [...list];

		for (let i = result.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			// @ts-expect-error This will work
			[result[i], result[j]] = [result[j], result[i]];
		}

		return result;
	}

	private static getPackageNameAndVersion(tag: string) {
		if (!tag || tag === "@") return { name: "", version: "" };

		if (!tag.startsWith("@")) {
			let [name, version] = z
				.tuple([z.string(), z.string()])
				.parse(tag.split("@"));
			return { name, version };
		}

		console.info(tag, { tag, splitted: tag.split("@") });

		let [, name, version] = z
			.tuple([z.string(), z.string(), z.string()])
			.parse(tag.split("@"));

		return { name: `@${name}`, version };
	}

	private static dedupeBySlug<Value extends { slug: string }>(
		items: Value[],
	): Value[] {
		let result: Value[] = [];

		for (let item of items) {
			if (!result.find((resultItem) => resultItem.slug === item.slug)) {
				result.push(item);

				if (result.length >= 3) break;
			}
		}

		return result;
	}

	/**
	 * can find the technologies name and version from a string
	 * @example
	 * this.#findTechnologiesInString(`hello world tech:@remix-run/react@1.10.0 tech:react@18 tech:@types/react-dom@18.5`)
	 */
	private static findTechnologiesInString(value: string) {
		if (!value.includes("tech:")) return [];

		return value
			.split(" ")
			.filter((value) => value.includes("tech:"))
			.map((value) => {
				return Tutorial.getPackageNameAndVersion(value.slice("tech:".length));
			});
	}
}
