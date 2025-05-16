import { getDB } from "~/middleware/drizzle";
import { Article } from "~/models/article.server";

export async function queryArticles() {
	let db = getDB();
	let articles = await Article.list({ db });
	return articles.map((article) => {
		return { path: article.pathname, title: article.title };
	});
}
