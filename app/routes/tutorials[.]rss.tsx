import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { xml } from "remix-utils/responses";

import { Tutorial } from "~/models/tutorial.server";
import { Logger } from "~/modules/logger.server";
import { RSS } from "~/modules/rss.server";
import { database } from "~/services/db.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let db = database(context.db);
	let tutorials = await Tutorial.list({ db });

	let rss = new RSS({
		title: "Tutorials by Sergio Xalambrí",
		description: "The complete list of tutorials wrote by @sergiodxa.",
		link: "https://sergiodxa.com/tutorials.rss",
	});

	for (let tutorial of tutorials) {
		let link = new URL(tutorial.pathname, "https://sergiodxa.com").toString();
		rss.addItem({
			guid: tutorial.id,
			title: tutorial.title,
			description: `${tutorial.excerpt}\n<a href="${link}">Read it on the web</a>`,
			link,
			pubDate: tutorial.createdAt.toUTCString(),
		});
	}

	return xml(rss.toString());
}
