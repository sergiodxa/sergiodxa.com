import { href } from "react-router";
import { xml } from "remix-utils/responses";
import { getDB } from "~/middleware/drizzle";
import { getI18nextInstance, getLocale } from "~/middleware/i18next";
import { Tutorial } from "~/models/tutorial.server";
import { RSS } from "~/modules/rss.server";
import type { Route } from "./+types/route";

export async function loader({ request }: Route.LoaderArgs) {
	let db = getDB();
	let tutorials = await Tutorial.list({ db });

	let locale = getLocale();
	let i18n = getI18nextInstance();
	let t = i18n.getFixedT(locale, "translation", "rss.tutorials");

	let rss = new RSS({
		title: t("title"),
		description: t("description"),
		link: new URL(href("/tutorials.rss"), request.url).toString(),
	});

	for (let tutorial of tutorials) {
		let link = new URL(tutorial.pathname, request.url).toString();

		rss.addItem({
			guid: tutorial.id,
			title: tutorial.title,
			description: `${tutorial.excerpt}\n<a href="${link}">${t("cta")}</a>`,
			link,
			pubDate: tutorial.createdAt.toUTCString(),
		});
	}

	return xml(rss.toString());
}
