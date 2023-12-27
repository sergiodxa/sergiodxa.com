import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { xml } from "remix-utils/responses";

import { Tutorial } from "~/models/tutorial.server";
import { Logger } from "~/modules/logger.server";
import { database } from "~/services/db.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let db = database(context.db);
	let tutorials = await Tutorial.list({ db });

	let headers = new Headers();
	headers.set("cache-control", "s-maxage=3600, stale-while-revalidate");

	let content = `
<rss version="2.0">
	<channel>
		<title>Tutorials by Sergio Xalambrí</title>
		<description>
			The complete list of tutorials wrote by @sergiodxa.
		</description>
		<link>https://sergiodxa.com/tutorials.rss</link>
	</channel>

	${tutorials
		.map((tutorial) => {
			return `<item>
		<title>${tutorial.title}</title>
		<description>${tutorial.excerpt}\n<a href="https://sergiodxa.com/${
			tutorial.pathname
		}">Read it on the web</a></description>
		<link>https://sergiodxa.com/tutorials/${tutorial.slug}</link>
		${
			tutorial.createdAt
				? `<pubDate>${new Date(tutorial.createdAt).toUTCString()}</pubDate>`
				: ""
		}
		<guid>${tutorial.slug}</guid>
	</item>`;
		})
		.join("\n	")}
    </rss>
  `;

	return xml(`<?xml version="1.0" encoding="UTF-8"?>${content}`, { headers });
}
