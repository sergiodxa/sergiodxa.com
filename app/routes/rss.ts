import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { xml } from "remix-utils/responses";

import { Article } from "~/models/article.server";
import { Glossary } from "~/models/glossary.server";
import { Like } from "~/models/like.server";
import { Tutorial } from "~/models/tutorial.server";
import { Logger } from "~/modules/logger.server";
import { RSS } from "~/modules/rss.server";
import { database } from "~/services/db.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let db = database(context.db);
	let [articles, likes, tutorials, glossary] = await Promise.all([
		Article.list({ db }),
		Like.list({ db }),
		Tutorial.list({ db }),
		Glossary.list({ db }),
	]);

	let feed = [
		...articles.map((article) => {
			let link = new URL(article.pathname, "https://sergiodxa.com").toString();

			let description = article.excerpt
				? `${article.excerpt}\n<a href="${link}">Read it on the web</a>`
				: `<a href="${link}">Read it on the web</a>`;

			return {
				guid: article.id,
				title: article.title,
				description,
				link,
				pubDate: article.createdAt.toUTCString(),
			};
		}),
		...likes.map((like) => ({
			guid: like.id,
			title: like.title,
			description: `<a href="${like.url}">Read it on the source</a>`,
			link: like.url.toString(),
			pubDate: like.createdAt.toUTCString(),
		})),
		...tutorials.map((tutorial) => {
			let link = new URL(tutorial.pathname, "https://sergiodxa.com").toString();

			let description = tutorial.excerpt
				? `${tutorial.excerpt}\n<a href="${link}">Read it on the web</a>`
				: `<a href="${link}">Read it on the web</a>`;

			return {
				guid: tutorial.id,
				title: tutorial.title,
				description,
				link,
				pubDate: tutorial.createdAt.toUTCString(),
			};
		}),
		...glossary.map((glossaryTerm) => {
			let url = new URL("https://sergiodxa.com/glossary");
			url.hash = glossaryTerm.slug;

			let link = url.toString();
			let title = glossaryTerm.title
				? `${glossaryTerm.term} (aka ${glossaryTerm.title})`
				: glossaryTerm.term;

			return {
				guid: glossaryTerm.id,
				title,
				description: glossaryTerm.definition,
				link,
				pubDate: glossaryTerm.createdAt.toUTCString(),
			};
		}),
	].sort(
		(a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
	);

	let rss = new RSS({
		title: "Sergio Xalambrí",
		description:
			"The complete list of articles, bookmarks, tutorials, and glossary terms of @sergiodxa.",
		link: "https://sergiodxa.com/rss",
	});

	for (let item of feed) rss.addItem(item);

	return xml(rss.toString());
}
