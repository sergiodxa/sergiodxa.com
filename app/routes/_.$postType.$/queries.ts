import type { AppLoadContext, MetaDescriptor } from "@remix-run/cloudflare";

import { Article } from "~/models/article.server";
import { Tutorial } from "~/models/tutorial.server";
import { I18n } from "~/modules/i18n.server";
import { database } from "~/services/db.server";

export async function queryArticle(
	context: AppLoadContext,
	request: Request,
	slug: string,
) {
	let db = database(context.db);

	try {
		let article = await Article.show({ db }, slug);

		let locale = await new I18n().getLocale(request);
		let t = await new I18n().getFixedT(locale);

		let author = await article.author;

		return {
			postType: "articles" as const,
			article: { title: article.title, body: await article.renderable },
			meta: [
				{
					title: t("article.meta.title", {
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
						wordCount: await article.wordCount,
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

export async function queryTutorial(
	context: AppLoadContext,
	request: Request,
	slug: string,
) {
	let db = database(context.db);

	try {
		let tutorial = await Tutorial.show({ db }, slug);

		let [recommendations, author, wordCount] = await Promise.all([
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
			tutorial.wordCount,
		]);

		let locale = await new I18n().getLocale(request);
		let t = await new I18n().getFixedT(locale);

		let title = t("tutorial.document.title", {
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
				content: await tutorial.renderable,
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
						wordCount,
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
