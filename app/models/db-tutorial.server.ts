import type { BaseMeta, PostAttributes } from "./post.server";
import type { Database } from "~/services/db.server";
import type { UUID } from "~/utils/uuid";

import { and, eq } from "drizzle-orm";
import * as semver from "semver";

import { Markdown } from "~/modules/md.server";
import { Tables } from "~/services/db.server";
import { assertUUID } from "~/utils/uuid";

import { Post } from "./post.server";

interface TutorialMeta extends BaseMeta {
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	tags?: string | string[];
}

type InsertTutorial = Omit<Tables.InsertPost, "id" | "type"> & TutorialMeta;

interface Services {
	db: Database;
}

// @ts-expect-error TS is an idiot
export class Tutorial extends Post<TutorialMeta> {
	override readonly type = "tutorial" as const;

	constructor(
		services: Services,
		input: PostAttributes<TutorialMeta> | PostAttributes<TutorialMeta>,
	) {
		super(services, input);
	}

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
		return Markdown.parse(`# ${this.title}\n${this.content}`);
	}

	private wordCountPromise?: Promise<number>;
	get wordCount() {
		if (this.wordCountPromise) return this.wordCountPromise;

		let titleLength = this.title.split(/\s+/).length;
		this.wordCountPromise = Markdown.plain(this.content).then((content) => {
			return content.toString().split(/\s+/).length + titleLength;
		});

		return this.wordCountPromise;
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
			for (let tag of this.shuffle(this.tags)) {
				let { name, version } = this.getPackageNameAndVersion(tag);

				let match = this.shuffle(item.tags).find((itemTag) => {
					let item = this.getPackageNameAndVersion(itemTag);
					if (item.name !== name) return false;
					return semver.gte(version, item.version);
				});

				if (match) result.push(item);
			}
		}

		return this.shuffle(this.dedupeBySlug(result)).slice(0, limit);
	}

	static override async list(services: Services) {
		let posts = await Post.list<TutorialMeta>(services, "tutorial");
		return posts.map((post) => new this(services, post));
	}

	static async findById(services: Services, id: UUID) {
		let post = await Post.show<TutorialMeta>(services, id);
		return new this(services, post);
	}

	static override async show(
		services: Services,
		slug: Tables.SelectPostMeta["value"],
	) {
		let result = await services.db.query.postMeta.findFirst({
			columns: { postId: true },
			where: and(
				eq(Tables.postMeta.key, "slug"),
				eq(Tables.postMeta.value, slug),
			),
		});

		assertUUID(result?.postId);

		let post = await Post.show<TutorialMeta>(services, result.postId);
		return new this(services, post);
	}

	static override async create(services: Services, input: InsertTutorial) {
		let post = await Post.create<TutorialMeta>(services, {
			...input,
			type: "tutorial",
		});

		return new this(services, post);
	}

	private shuffle<Value>(list: Value[]) {
		let result = [...list];

		for (let i = result.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[result[i], result[j]] = [result[j], result[i]];
		}

		return result;
	}

	private getPackageNameAndVersion(tag: string) {
		if (!tag.startsWith("@")) {
			let [name, version] = tag.split("@");
			return { name, version };
		}

		let [, name, version] = tag.split("@");
		return { name: `@${name}`, version };
	}

	private dedupeBySlug<Value extends { slug: string }>(
		items: Value[],
	): Value[] {
		let result: Value[] = [];

		for (let item of items) {
			if (!result.find((resultItem) => resultItem.slug === item.slug)) {
				result.push(item);

				if (result.length >= 3) break;

				continue;
			}
		}

		return result;
	}
}