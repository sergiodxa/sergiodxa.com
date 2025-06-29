import { type MetaDescriptor, href } from "react-router";
import { getI18nextInstance, getLocale } from "~/middleware/i18next";
import findArticleBySlug from "~/services/find-article-by-slug";
import findTutorialBySlug from "~/services/find-tutorial-by-slug";
import findTutorialRecommendationsBySlug from "~/services/find-tutorial-recommendations-by-slug";
import { Markdown } from "~/utils/markdown";

export async function queryArticle(request: Request, slug: string) {
	try {
		let article = await findArticleBySlug(slug);

		let i18n = getI18nextInstance();

		return {
			postType: "articles" as const,
			article: {
				title: article.title,
				body: Markdown.parse(`# ${article.title}\n${article.content}`),
			},
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
						new URL(
							href("/:postType/*", { postType: "articles", "*": article.slug }),
							request.url,
						).toString(),
				},
				{
					tagName: "link",
					rel: "alternate",
					hrefLang: "en",
					href: new URL(
						href("/md/:postType/*", {
							postType: "articles",
							"*": article.slug,
						}),
						request.url,
					).toString(),
				},
				{
					"script:ld+json": {
						"@context": "https://schema.org",
						"@type": "Article",
						headline: article.title,
						description: article.excerpt,
						author: {
							"@type": "Person",
							name: article.author.displayName,
							url: new URL("/about", request.url).toString(),
						},
						wordCount: countWords(article.title, article.content),
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
	try {
		let [tutorial, recommendations] = await Promise.all([
			findTutorialBySlug(slug),
			findTutorialRecommendationsBySlug(slug),
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
				content: Markdown.parse(tutorial.content),
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
					href: new URL(
						href("/:postType/*", {
							postType: "tutorials",
							"*": tutorial.slug,
						}),
						request.url,
					).toString(),
				},
				{
					tagName: "link",
					rel: "alternate",
					hrefLang: "en",
					href: new URL(
						href("/md/:postType/*", {
							postType: "tutorials",
							"*": tutorial.slug,
						}),
						request.url,
					).toString(),
				},
				{
					"script:ld+json": {
						"@context": "https://schema.org",
						"@type": "Article",
						headline: tutorial.title,
						description: tutorial.excerpt,
						author: {
							"@type": "Person",
							name: tutorial.author.displayName,
							url: new URL("/about", request.url).toString(),
						},
						wordCount: countWords(tutorial.title, tutorial.content),
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

function countWords(title: string, content: string) {
	let titleLength = title.split(/\s+/).length;
	return Markdown.plain(content).split(/\s+/).length + titleLength;
}
