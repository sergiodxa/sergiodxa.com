import type { MetaDescriptor } from "react-router";
import { getDB } from "~/middleware/drizzle";
import { getI18nextInstance, getLocale } from "~/middleware/i18next";
import { Article } from "~/models/article.server";
import { Tutorial } from "~/models/tutorial.server";

export async function queryArticle(request: Request, slug: string) {
	let db = getDB();

	try {
		let article = await Article.show({ db }, slug);

		let i18n = getI18nextInstance();

		let author = await article.author;

		return {
			postType: "articles" as const,
			article: { title: article.title, body: article.renderable },
			meta: [
				{
					title: i18n.t("article.meta.title", {
						note: article.title,
						interpolation: { escapeValue: false },
					}),
				},
				{ name: "description", content: article.excerpt },
				{
					tagName: "link",
					rel: "canonical",
					href:
						article.canonicalUrl ??
						new URL(article.pathname, request.url).toString(),
				},
				{
					"script:ld+json": {
						"@context": "https://schema.org",
						"@type": "Article",
						headline: article.title,
						description: article.excerpt,
						author: {
							"@type": "Person",
							name: author.displayName,
							url: new URL("/about", request.url).toString(),
						},
						wordCount: article.wordCount,
						datePublished: article.createdAt.toISOString(),
						dateModified: article.updatedAt.toISOString(),
					},
				},
			] satisfies MetaDescriptor[],
		};
	} catch (error) {
		console.error(error);
		throw new Error("Article not found");
	}
}

export async function queryTutorial(request: Request, slug: string) {
	let db = getDB();

	try {
		let tutorial = await Tutorial.show({ db }, slug);

		let [recommendations, author] = await Promise.all([
			tutorial.recommendations({ db }).then((tutorials) => {
				return tutorials.map((tutorial) => {
					return {
						title: tutorial.title,
						slug: tutorial.slug,
						tag: tutorial.tags.at(0),
					};
				});
			}),
			tutorial.author,
		]);

		let locale = getLocale();
		let i18n = getI18nextInstance();

		let title = i18n.t("tutorial.document.title", {
			title: tutorial.title,
			interpolation: { escapeValue: false },
		});

		return {
			postType: "tutorials" as const,
			tutorial: {
				id: tutorial.id,
				slug: tutorial.slug,
				tags: tutorial.tags,
				title: tutorial.title,
				content: tutorial.renderable,
			},
			recommendations,
			meta: [
				{ title },
				{ name: "description", content: tutorial.excerpt },
				{ property: "og:title", content: title },
				{ property: "og:type", content: "article" },
				{ property: "og:url", content: request.url },
				{ property: "og:site_name", content: "Sergio Xalambrí" },
				{ property: "og:locale", content: locale },
				{ property: "twitter:card", content: "summary" },
				{ property: "twitter:creator", content: "@sergiodxa" },
				{ property: "twitter:site", content: "@sergiodxa" },
				{ property: "twitter:title", content: title },
				{
					tagName: "link",
					rel: "canonical",
					href: new URL(tutorial.pathname, request.url).toString(),
				},
				{
					"script:ld+json": {
						"@context": "https://schema.org",
						"@type": "Article",
						headline: tutorial.title,
						description: tutorial.excerpt,
						author: {
							"@type": "Person",
							name: author.displayName,
							url: new URL("/about", request.url).toString(),
						},
						wordCount: tutorial.wordCount,
						datePublished: tutorial.createdAt.toISOString(),
						dateModified: tutorial.updatedAt.toISOString(),
					},
				},
			] satisfies MetaDescriptor[],
		};
	} catch (error) {
		console.error(error);
		throw new Error("Tutorial not found");
	}
}
