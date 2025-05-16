import { href } from "react-router";
import { getRequest } from "~/middleware/context-storage";
import { getDB } from "~/middleware/drizzle";
import { getI18nextInstance, getLocale } from "~/middleware/i18next";
import { Article } from "~/models/article.server";
import { Glossary } from "~/models/glossary.server";
import { Like } from "~/models/like.server";
import { Tutorial } from "~/models/tutorial.server";

interface RSSItem {
	guid: string;
	title: string;
	description: string;
	link: string;
	pubDate: string;
}

export async function queryArticles(): Promise<RSSItem[]> {
	let request = getRequest();
	let db = getDB();

	let articles = await Article.list({ db });

	let locale = getLocale();
	let i18n = getI18nextInstance();
	let t = i18n.getFixedT(locale, "translation", "rss");

	return articles.map((article) => {
		let link = new URL(article.pathname, request.url).toString();

		let description = article.excerpt
			? `${article.excerpt}\n<a href="${link}">${t("cta")}</a>`
			: `<a href="${link}">${t("cta")}</a>`;

		return {
			guid: article.id,
			title: article.title,
			description,
			link,
			pubDate: article.createdAt.toUTCString(),
		};
	});
}

export async function queryLikes(): Promise<RSSItem[]> {
	let db = getDB();

	let likes = await Like.list({ db });

	let locale = getLocale();
	let i18n = getI18nextInstance();
	let t = i18n.getFixedT(locale, "translation", "rss");

	return likes.map((like) => ({
		guid: like.id,
		title: like.title,
		description: `<a href="${like.url}">${t("cta")}</a>`,
		link: like.url.toString(),
		pubDate: like.createdAt.toUTCString(),
	}));
}

export async function queryTutorials(): Promise<RSSItem[]> {
	let request = getRequest();
	let db = getDB();

	let tutorials = await Tutorial.list({ db });

	let locale = getLocale();
	let i18n = getI18nextInstance();
	let t = i18n.getFixedT(locale, "translation", "rss");

	return tutorials.map((tutorial) => {
		let link = new URL(tutorial.pathname, request.url).toString();

		let description = tutorial.excerpt
			? `${tutorial.excerpt}\n<a href="${link}">${t("cta")}</a>`
			: `<a href="${link}">${t("cta")}</a>`;

		return {
			guid: tutorial.id,
			title: tutorial.title,
			description,
			link,
			pubDate: tutorial.createdAt.toUTCString(),
		};
	});
}

export async function queryGlossary(): Promise<RSSItem[]> {
	let request = getRequest();
	let db = getDB();

	let glossary = await Glossary.list({ db });

	return glossary.map((glossaryTerm) => {
		let url = new URL(href("/glossary"), request.url);
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
	});
}
