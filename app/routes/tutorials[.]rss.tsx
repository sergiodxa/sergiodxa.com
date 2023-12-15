import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { xml } from "remix-utils/responses";

import { Tutorial } from "~/models/tutorial.server";
import { Logger } from "~/modules/logger.server";
import { GitHub } from "~/services/github.server";

export async function loader(_: LoaderFunctionArgs) {
	void new Logger(_.context.env.LOGTAIL_SOURCE_TOKEN).http(_.request);

	let gh = new GitHub(_.context.env.GH_APP_ID, _.context.env.GH_APP_PEM);
	let tutorials = await Tutorial.list({ gh, kv: _.context.kv.tutorials });

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
		<description><a href="https://sergiodxa.com/tutorials/${tutorial.slug}">Read it on the web</a></description>
		<link>https://sergiodxa.com/tutorials/${tutorial.slug}</link>
		<guid>${tutorial.slug}</guid>
	</item>`;
		})
		.join("\n	")}
    </rss>
  `;

	return xml(`<?xml version="1.0" encoding="UTF-8"?>${content}`, { headers });
}
