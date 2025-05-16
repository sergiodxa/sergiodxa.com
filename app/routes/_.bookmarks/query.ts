import { getDB } from "~/middleware/drizzle";
import { Like } from "~/models/like.server";

export async function queryBookmarks() {
	let bookmarks = await Like.list({ db: getDB() });
	return bookmarks.map((article) => {
		let date = article.createdAt
			.toISOString()
			.replaceAll("-", "")
			.replaceAll(":", "")
			.replaceAll(".", "")
			.replace("T", "");

		let url = article.url.toString();

		let cached = `https://web.archive.org/web/${date}/${url}`;

		return { title: article.title, url, cached };
	});
}
