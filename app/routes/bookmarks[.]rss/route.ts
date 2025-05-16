import { xml } from "remix-utils/responses";

import { href } from "react-router";
import { getDB } from "~/middleware/drizzle";
import { getI18nextInstance, getLocale } from "~/middleware/i18next";
import { Like } from "~/models/like.server";
import { RSS } from "~/modules/rss.server";
import type { Route } from "./+types/route";

export async function loader({ request }: Route.LoaderArgs) {
	let likes = await Like.list({ db: getDB() });

	let locale = getLocale();
	let i18n = getI18nextInstance();
	let t = i18n.getFixedT(locale, "translation", "rss.bookmarks");

	let rss = new RSS({
		title: t("title"),
		description: t("description"),
		link: new URL(href("/bookmarks.rss"), request.url).toString(),
	});

	for (let like of likes) {
		let link = like.url.toString();

		rss.addItem({
			guid: like.id,
			title: like.title,
			description: `<a href="${link}">${t("cta")}</a>`,
			link,
			pubDate: like.createdAt.toUTCString(),
		});
	}

	return xml(rss.toString());
}
