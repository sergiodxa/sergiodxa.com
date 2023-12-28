import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { xml } from "remix-utils/responses";

import { Like } from "~/models/like.server";
import { Logger } from "~/modules/logger.server";
import { RSS } from "~/modules/rss.server";
import { database } from "~/services/db.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let db = database(context.db);
	let likes = await Like.list({ db });

	let rss = new RSS({
		title: "Bookmarks by Sergio Xalambrí",
		description: "The complete list of bookmarks saved by @sergiodxa.",
		link: "https://sergiodxa.com/bookmarks.rss",
	});

	for (let like of likes) {
		let link = like.url.toString();
		rss.addItem({
			guid: like.id,
			title: like.title,
			description: `<a href="${link}">Read it on the web</a>`,
			link,
			pubDate: like.createdAt.toUTCString(),
		});
	}

	return xml(rss.toString());
}
