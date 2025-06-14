import { getI18nextInstance, getLocale } from "~/middleware/i18next";
import findArticleBySlug from "~/services/find-article-by-slug";
import findTutorialBySlug from "~/services/find-tutorial-by-slug";

export async function queryArticle(slug: string) {
	try {
		let article = await findArticleBySlug(slug);
		if (!article) throw new Error("Article not found");

		return [`# ${article.title}`, article.content].join("\n\n");
	} catch (error) {
		console.error(error);
		throw new Error("Article not found");
	}
}

export async function queryTutorial(slug: string) {
	let locale = getLocale();
	let i18next = getI18nextInstance();

	try {
		let tutorial = await findTutorialBySlug(slug);
		if (!tutorial) throw new Error("Tutorial not found");

		let value = [`# ${tutorial.title}`];

		if (tutorial.tags?.[0]) {
			let list = new Intl.ListFormat(locale, {
				style: "long",
				type: "conjunction",
			});

			value.push(
				`${i18next.t("tutorial.tags")}: ${list.format(tutorial.tags)}`,
			);
		}

		value.push(tutorial.content);

		return value.join("\n\n");
	} catch (error) {
		console.error(error);
		throw new Error("Tutorial not found");
	}
}
