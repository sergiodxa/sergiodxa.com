import type { GitHub } from "~/services/github";
import type { Attributes } from "~/services/markdown";

import * as semver from "semver";
import { z } from "zod";

import { AttributesSchema, Markdown } from "~/services/markdown";
import { isEmpty } from "~/utils/arrays";

interface Recommendation {
	title: string;
	tag: string;
	slug: string;
}

export class Tutorial {
	private constructor(
		public readonly slug: string,
		private file: Markdown,
	) {}

	get title() {
		return this.file.attributes.title;
	}

	get tags() {
		return this.file.attributes.tags;
	}

	get body() {
		return this.file.body;
	}

	toJSON() {
		return {
			path: Tutorial.slugToPath(this.slug),
			slug: this.slug,
			title: this.title,
			tags: this.tags,
			body: this.body,
		};
	}

	async recommendations({ gh, kv }: { gh: GitHub; kv: KVNamespace }) {
		let list = await Tutorial.list({ gh, kv });

		if (isEmpty(list)) return [];

		// Remove the current tutorial from the list of tutorials
		list = list.filter((item) => !item.slug.includes(this.slug));

		let result: Recommendation[] = [];

		for (let item of list) {
			for (let tag of shuffle(this.tags)) {
				let { name, version } = getPackageNameAndVersion(tag);

				let match = shuffle(item.tags).find((itemTag) => {
					let { name: itemName, version: itemVersion } =
						getPackageNameAndVersion(itemTag);
					if (itemName !== name) return false;
					return semver.gte(version, itemVersion);
				});

				if (match) {
					result.push({ title: item.title, tag: match, slug: item.slug });
				}
			}
		}

		return shuffle(dedupeBySlug(result)).slice(0, 3);
	}

	static async list(
		{ gh, kv }: { gh: GitHub; kv: KVNamespace },
		query?: string,
	) {
		let tutorials: Array<Attributes & { slug: string }> = [];

		let list = await kv.list({ prefix: "tutorial:", limit: 1000 });

		for (let key of list.keys) {
			if (!key.metadata) {
				console.info("Missing Metadata in Key: %s", key.name);
				await kv.delete(key.name);
				continue;
			}

			let result = AttributesSchema.extend({
				slug: z.string(),
			}).safeParse(key.metadata);

			if (!result.success) {
				console.info("Invalid Metadata in Key: %s", key.name);
				await kv.delete(key.name);
				continue;
			}

			tutorials.push(result.data);
		}

		if (isEmpty(tutorials)) {
			console.info("Cache Miss: /tutorials");

			let filePaths = await gh.listMarkdownFiles("tutorials");
			for await (let filePath of filePaths) {
				let slug = Tutorial.pathToSlug(filePath);
				let tutorial = await Tutorial.show({ gh, kv }, slug);
				tutorials.push({ slug, title: tutorial.title, tags: tutorial.tags });
			}
		} else console.info("Cache Hit: /tutorials");

		if (query) {
			console.info('Filtering Tutorials by Query: "%s"', query);
			return tutorials.filter((tutorial) => {
				for (let word of query.toLowerCase().split(" ")) {
					if (tutorial.title.toLowerCase().includes(word)) return true;
				}
				return false;
			});
		}

		return tutorials;
	}

	static async show(
		{ gh, kv }: { gh: GitHub; kv: KVNamespace },
		slug: string,
	): Promise<Tutorial> {
		let cached = await kv.get<Markdown>(Tutorial.slugToKey(slug), "json");

		if (cached) {
			console.info("Cache Hit: /tutorials/%s", slug);
			try {
				let markdown = new Markdown(cached.body, cached.attributes);
				return new Tutorial(slug, markdown);
			} catch {
				await kv.delete(Tutorial.slugToKey(slug));
			}
		} else console.info("Cache Miss: /tutorials/%s", slug);

		let content = await gh.fetchMarkdownFile(`tutorials/${slug}.md`);

		let markdown = new Markdown(content);
		let tutorial = new Tutorial(slug, markdown);

		await kv.put(Tutorial.slugToKey(slug), JSON.stringify(markdown), {
			metadata: { slug, tags: tutorial.tags, title: tutorial.title },
			expirationTtl: 60 * 60 * 24 * 7,
		});

		return tutorial;
	}

	private static pathToSlug(path: string) {
		return path.split("/").slice(2).join("/").slice(0, -3);
	}

	private static slugToKey(slug: string) {
		return `tutorial:${slug}`;
	}

	private static slugToPath(slug: string) {
		return `tutorials/${slug}.md`;
	}
}

function shuffle<Value>(list: Value[]) {
	let result = [...list];

	for (let i = result.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}

	return result;
}

function getPackageNameAndVersion(tag: string) {
	if (!tag.startsWith("@")) {
		let [name, version] = tag.split("@");
		return { name, version };
	}

	let [, name, version] = tag.split("@");
	return { name: `@${name}`, version };
}

function dedupeBySlug(items: Recommendation[]): Recommendation[] {
	let result: Recommendation[] = [];

	for (let item of items) {
		if (!result.find((resultItem) => resultItem.slug === item.slug)) {
			result.push(item);

			if (result.length >= 3) break;

			continue;
		}
	}

	return result;
}
