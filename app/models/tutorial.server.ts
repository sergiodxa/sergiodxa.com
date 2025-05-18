import { and, eq, sql } from "drizzle-orm";
import Fuse from "fuse.js";
import * as semver from "semver";
import { z } from "zod";
import type { Database } from "~/db";
import * as schema from "~/db/schema";
import { measure } from "~/middleware/server-timing";
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

	static recommendations(services: Services, slug: string) {
		return measure("Tutorial", "Tutorial.recommendations", async () => {
			const { results } = await services.db.run(sql`
        WITH current AS (
          SELECT pm.post_id, p.type, pm_tags.value AS tag
          FROM post_meta pm
          JOIN post_meta pm_tags ON pm.post_id = pm_tags.post_id AND pm_tags.key = 'tags'
          JOIN posts p ON pm.post_id = p.id
          WHERE pm.key = 'slug' AND pm.value = ${slug}
        )
        SELECT
          p.id,
          slug_meta.value AS slug,
          title_meta.value AS title,
          tags_meta.value AS matchedTag
        FROM posts p
        JOIN post_meta tags_meta
          ON p.id = tags_meta.post_id AND tags_meta.key = 'tags'
        JOIN post_meta slug_meta
          ON p.id = slug_meta.post_id AND slug_meta.key = 'slug'
        JOIN post_meta title_meta
          ON p.id = title_meta.post_id AND title_meta.key = 'title'
        WHERE
          p.type = (SELECT type FROM current)
          AND p.id != (SELECT post_id FROM current)
          AND EXISTS (
            SELECT 1
            FROM current c
            WHERE
              SUBSTR(tags_meta.value, 1, INSTR(tags_meta.value, '@') - 1) =
                SUBSTR(c.tag, 1, INSTR(c.tag, '@') - 1)
              AND tags_meta.value >= c.tag
          )
        LIMIT 3;
      `);
			return z
				.object({
					id: z.string().uuid(),
					slug: z.string(),
					title: z.string(),
					matchedTag: z.string(),
				})
				.array()
				.max(3)
				.parse(results);
		});
	}

	async recommendations(services: Services) {
		return Tutorial.recommendations(services, this.slug);
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
		let result = await measure("tutorial", "Tutorial.show", () => {
			return services.db.query.postMeta.findFirst({
				where: and(
					eq(schema.postMeta.key, "slug"),
					eq(schema.postMeta.value, slug),
				),
				with: { post: { with: { meta: true } } },
			});
		});

		if (!result) throw new Error(`Couldn't find tutorial with slug ${slug}`);

		let id = result.postId;
		let authorId = result.post.authorId;

		assertUUID(id);
		assertUUID(authorId);

		let post = new Post(services, {
			id,
			authorId,
			type: result.post.type,
			createdAt: result.post.createdAt,
			updatedAt: result.post.updatedAt,
			meta: result.post.meta.reduce((acc, item) => {
				acc[item.key] = item.value;
				return acc;
			}, {} as TutorialMeta),
		});

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

	private static getPackageNameAndVersion(tag: string) {
		if (!tag || tag === "@") return { name: "", version: "" };

		if (!tag.startsWith("@")) {
			let result = z.tuple([z.string(), z.string()]).safeParse(tag.split("@"));
			if (result.error) {
				console.error(result.error);
				return { name: "", version: "" };
			}
			return { name: result.data[0], version: result.data[1] };
		}

		let result = z
			.tuple([z.string(), z.string(), z.string()])
			.safeParse(tag.split("@"));

		if (result.error) {
			console.error(result.error);
			return { name: "", version: "" };
		}
		return { name: `@${result.data[1]}`, version: result.data[2] };
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
