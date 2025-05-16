import { href } from "react-router";
import { xml } from "remix-utils/responses";
import { getDB } from "~/middleware/drizzle";
import { getI18nextInstance, getLocale } from "~/middleware/i18next";
import { Article } from "~/models/article.server";
import { RSS } from "~/modules/rss.server";
import type { Route } from "./+types/route";

export async function loader({ request }: Route.LoaderArgs) {
	let articles = await Article.list({ db: getDB() });

	let locale = getLocale();
	let i18n = getI18nextInstance();
	let t = i18n.getFixedT(locale, "translation", "rss.articles");

	let rss = new RSS({
		title: t("title"),
		description: t("description"),
		link: new URL(href("/articles.rss"), request.url).toString(),
	});

	for (let article of articles) {
		let link = new URL(article.pathname, request.url).toString();

		rss.addItem({
			guid: article.id,
			title: article.title,
			description: `${article.excerpt}\n<a href="${link}">${t("cta")}</a>`,
			link,
			pubDate: article.createdAt.toUTCString(),
		});
	}

	return xml(rss.toString());
}
