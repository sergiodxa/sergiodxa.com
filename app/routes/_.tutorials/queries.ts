import { getDB } from "~/middleware/drizzle";
import { getI18nextInstance } from "~/middleware/i18next";
import { Tutorial } from "~/models/tutorial.server";
import type { Route } from "./+types/route";

export async function queryTutorials(query: string | null) {
	let db = getDB();

	let tutorials = query
		? await Tutorial.search({ db }, query)
		: await Tutorial.list({ db });

	return tutorials.map((tutorial) => {
		if (tutorial instanceof Tutorial) {
			return {
				path: tutorial.pathname,
				title: tutorial.title,
			};
		}

		return {
			path: tutorial.item.pathname,
			title: tutorial.item.title,
		};
	});
}

export function getMeta(url: URL, query: string) {
	let { t } = getI18nextInstance();

	let meta: Route.MetaDescriptors = [];

	if (query === "") {
		meta.push({ title: t("tutorials.meta.title.default") });
	} else {
		meta.push({
			title: t("tutorials.meta.title.search", {
				query: decodeURIComponent(query),
			}),
		});
	}

	meta.push({
		tagName: "link",
		rel: "alternate",
		type: "application/rss+xml",
		href: "/tutorials.rss",
	});

	meta.push({
		tagName: "link",
		rel: "canonical",
		href: new URL("/tutorials", url).toString(),
	});

	return meta;
}
