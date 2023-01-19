import type { z } from "zod";
import type { TutorialSchema } from "~/entities/data";

import { parameterize } from "inflected";
import * as semver from "semver";

import { Service } from "~/services/service";

export namespace Tutorials {
	let PAGE_SIZE = 10;

	interface Paginated<Value> {
		list: Value[];
		page: {
			size: number;
			current: number;
			first: number;
			next: number | null;
			prev: number | null;
			last: number;
		};
		total: number;
	}

	export class SearchTutorials extends Service {
		async perform(query: string, page = 1, size = PAGE_SIZE) {
			let tutorials = await this.repos.data.tutorials();

			query = query.toLowerCase();

			if (query.trim().length === 0) return paginate(tutorials, page, size);

			let techs = this.#findTechnologiesInString(query);

			for (let tech of techs) {
				if (tech.version) {
					query = query.replace(`tech:${tech.name}@${tech.version}`, "");
				} else {
					query = query.replace(`tech:${tech.name}`, "");
				}

				tutorials = tutorials.filter((tutorial) => {
					for (let techInTutorial of tutorial.technologies) {
						if (techInTutorial.name !== tech.name) continue;
						if (!tech.version) return true;
						if (semver.gte(techInTutorial.version, tech.version)) return true;
					}

					return false;
				});
			}

			for (let word of query.trim()) {
				tutorials = tutorials.filter((tutorial) => {
					let title = tutorial.title.toLowerCase();
					let content = tutorial.content.toLowerCase();

					if (title.includes(word)) return true;
					if (content.includes(word)) return true;

					return false;
				});
			}

			return paginate(tutorials, page, size);
		}

		/**
		 * can find the technologies name and version from a string
		 * @example
		 * this.#findTechnologiesInString(`hello world tech:@remix-run/react@1.10.0 tech:react@18 tech:@types/react-dom@18.5`)
		 */
		#findTechnologiesInString(value: string) {
			if (!value.includes("tech:")) return [];

			let techs = value
				.split(" ")
				.filter((value) => value.includes("tech:"))
				.map((value) => {
					value = value.slice("tech:".length);
					if (!value.startsWith("@")) return value.split("@");
					let [name, version] = value.split("@").slice(1);
					return [`@${name}`, version];
				})
				.map((value) => {
					return { name: value[0], version: value[1] };
				});

			return techs;
		}
	}

	export class ReadTutorial extends Service {
		async perform(slug: string) {
			let tutorial = await this.repos.data.findTutorialBySlug(slug);
			if (!tutorial) return null;
			let related = await this.#findRelated(tutorial);

			return { tutorial, related };
		}

		async #findRelated(original: z.infer<typeof TutorialSchema>) {
			let tutorials = await this.repos.data.tutorials();

			return this.#shuffle(
				tutorials.filter((tutorial) => {
					if (tutorial.id === original.id) {
						return false;
					}

					let names = tutorial.technologies.map((tech) => tech.name);

					for (let technology of original.technologies) {
						if (!names.includes(technology.name)) {
							continue;
						}

						let tech = tutorial.technologies.find(
							(tech) => tech.name === technology.name
						);

						if (!tech) continue;

						return semver.satisfies(tech.version, `^${technology.version}`);
					}

					return false;
				})
			)
				.slice(0, 3)
				.map((tutorial) => {
					return {
						...tutorial,
						content: tutorial.content.slice(0, 140) + "…",
					};
				});
		}

		#shuffle<Value>(list: Value[]): Value[] {
			let newList = [...list];

			for (let i = newList.length - 1; i > 0; i--) {
				let j = Math.floor(Math.random() * (i + 1));
				[newList[i], newList[j]] = [newList[j], newList[i]];
			}

			return newList;
		}
	}

	export class ListTutorials extends Service {
		async perform(page = 1, size = PAGE_SIZE) {
			let tutorials = await this.repos.data.tutorials();
			return paginate(tutorials, page, size);
		}
	}

	export class RSSFeedTutorials extends Service {
		async perform() {
			let tutorials = await this.repos.data.tutorials();

			return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tutorials of sergiodxa.com</title>
    <description>Tutorials wrote by Sergio Xalambrí</description>
    <link>https://sergiodxa.com/tutorials.xml</link>
    ${tutorials
			.map((tutorial) => {
				return `<item>
        <title>${tutorial.title}</title>
        <description>${tutorial.content}</description>
        <link>https://sergiodxa.com/tutorials/${tutorial.slug}</link>
        <pubDate>${tutorial.createdAt.toDateString()}</pubDate>
        <author>Sergio Xalambrí</author>
        <guid>${tutorial.id}</guid>
      </item>`;
			})
			.join("\n    ")
			.trim()}
  </channel>
</rss>`;
		}
	}

	export class WriteTutorial extends Service {
		async perform(
			data: Pick<
				z.input<typeof TutorialSchema>,
				"title" | "content" | "technologies"
			>
		): Promise<z.infer<typeof TutorialSchema>> {
			let slug = parameterize(data.title);

			let result = await this.repos.data.createTutorial({
				...data,
				slug,
				questions: [],
			});

			if (result.type === "tutorial") return result;
			throw new Error("Error creating tutorial");
		}
	}

	function paginate<Value>(
		list: Value[],
		page = 1,
		pageSize = PAGE_SIZE
	): Paginated<Value> {
		let start = (page - 1) * pageSize;
		let end = start + pageSize;

		let paginatedList = list.slice(start, end);

		return {
			list: paginatedList,
			page: {
				size: paginatedList.length,
				current: page,
				first: 1,
				prev: start > 0 ? page - 1 : null,
				next: end < list.length ? page + 1 : null,
				last: Math.ceil(list.length / pageSize) + 1,
			},
			total: list.length,
		};
	}
}
