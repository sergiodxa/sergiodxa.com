import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { xml } from "remix-utils/responses";

import { Article } from "~/models/article.server";
import { Logger } from "~/modules/logger.server";
import { RSS } from "~/modules/rss.server";
import { database } from "~/services/db.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let db = database(context.db);
	let articles = await Article.list({ db });

	let rss = new RSS({
		title: "Articles by Sergio Xalambrí",
		description: "The complete list of articles wrote by @sergiodxa.",
		link: "https://sergiodxa.com/articles.rss",
	});

	for (let article of articles) {
		let link = new URL(article.pathname, "https://sergiodxa.com").toString();
		rss.addItem({
			guid: article.id,
			title: article.title,
			description: `${article.excerpt}\n<a href="${link}">Read it on the web</a>`,
			link,
			pubDate: article.createdAt.toUTCString(),
		});
	}

	return xml(rss.toString());
}
