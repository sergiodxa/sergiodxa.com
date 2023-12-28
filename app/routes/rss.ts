import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { xml } from "remix-utils/responses";

import { Article } from "~/models/article.server";
import { Like } from "~/models/like.server";
import { Tutorial } from "~/models/tutorial.server";
import { Logger } from "~/modules/logger.server";
import { RSS } from "~/modules/rss.server";
import { database } from "~/services/db.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let db = database(context.db);
	let [articles, likes, tutorials] = await Promise.all([
		Article.list({ db }),
		Like.list({ db }),
		Tutorial.list({ db }),
	]);

	let feed = [
		...articles.map((article) => {
			let link = new URL(article.pathname, "https://sergiodxa.com").toString();

			return {
				guid: String(article.id),
				title: article.title,
				description: `${article.excerpt}\n<a href="${link}">Read it on the web</a>`,
				link,
				pubDate: article.createdAt.toUTCString(),
			};
		}),
		...likes.map((like) => ({
			guid: String(like.id),
			title: like.title,
			description: `<a href="${like.url}">Read it on the source</a>`,
			link: like.url.toString(),
			pubDate: like.createdAt.toUTCString(),
		})),
		...tutorials.map((tutorial) => {
			let link = new URL(tutorial.pathname, "https://sergiodxa.com").toString();

			return {
				guid: String(tutorial.id),
				title: tutorial.title,
				description: `${tutorial.excerpt}\n<a href="${link}">Read it on the web</a>`,
				link,
				pubDate: tutorial.createdAt.toUTCString(),
			};
		}),
	].sort((a, b) => {
		let aDate = new Date(a.pubDate);
		let bDate = new Date(b.pubDate);
		return bDate.getTime() - aDate.getTime();
	});

	let rss = new RSS({
		title: "Sergio Xalambrí",
		description:
			"The complete list of articles, bookmarks and tutorials of @sergiodxa.",
		link: "https://sergiodxa.com/rss",
	});

	for (let item of feed) rss.addItem(item);

	return xml(rss.toString());
}
