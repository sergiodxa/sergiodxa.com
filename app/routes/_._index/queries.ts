import { getDB } from "~/middleware/drizzle";
import { Article } from "~/models/article.server";
import { Glossary } from "~/models/glossary.server";
import { Like } from "~/models/like.server";
import { Tutorial } from "~/models/tutorial.server";

type ArticleItem = Awaited<ReturnType<typeof queryArticles>>[number];
type BookmarkItem = Awaited<ReturnType<typeof queryBookmarks>>[number];
type TutorialItem = Awaited<ReturnType<typeof queryTutorials>>[number];
type GlossaryItem = Awaited<ReturnType<typeof queryGlossary>>[number];

export async function queryArticles(query: string | null) {
	let db = getDB();

	if (query) {
		let articles = await Article.search({ db }, query);
		return articles.map(({ item, score = 0 }) => {
			return {
				id: item.id,
				type: "article",
				payload: {
					title: item.title,
					link: item.pathname,
					createdAt: new Date(item.createdAt).getTime(),
				},
				score,
			};
		});
	}

	let articles = await Article.list({ db });
	return articles.map((item) => {
		return {
			id: item.id,
			type: "article",
			payload: {
				title: item.title,
				link: item.pathname,
				createdAt: new Date(item.createdAt).getTime(),
			},
			score: 0,
		};
	});
}

export async function queryBookmarks(query: string | null) {
	let db = getDB();

	if (query) {
		let likes = await Like.search({ db }, query);
		return likes.map(({ item, score = 0 }) => {
			return {
				id: item.id,
				type: "bookmark",
				payload: {
					title: item.title,
					link: item.url.toString(),
					createdAt: new Date(item.createdAt).getTime(),
				},
				score,
			};
		});
	}

	let likes = await Like.list({ db });
	return likes.map((item) => {
		return {
			id: item.id,
			type: "bookmark",
			payload: {
				title: item.title,
				link: item.url.toString(),
				createdAt: new Date(item.createdAt).getTime(),
			},
			score: 0,
		};
	});
}

export async function queryTutorials(query: string | null) {
	let db = getDB();

	if (query) {
		let tutorials = await Tutorial.search({ db }, query);
		return tutorials.map(({ item, score = 0 }) => {
			return {
				id: item.id,
				type: "tutorial",
				payload: {
					title: item.title,
					link: item.pathname,
					createdAt: new Date(item.createdAt).getTime(),
				},
				score,
			};
		});
	}

	let tutorials = await Tutorial.list({ db });
	return tutorials.map((item) => {
		return {
			id: item.id,
			type: "tutorial",
			payload: {
				title: item.title,
				link: item.pathname,
				createdAt: new Date(item.createdAt).getTime(),
			},
			score: 0,
		};
	});
}

export async function queryGlossary(query: string | null) {
	let db = getDB();

	if (query) {
		let glossary = await Glossary.search({ db }, query);
		return glossary.map(({ item, score = 0 }) => {
			return {
				id: item.id,
				type: "glossary",
				payload: {
					title: item.term,
					link: item.pathname,
					createdAt: new Date(item.createdAt).getTime(),
				},
				score,
			};
		});
	}

	let glossary = await Glossary.list({ db });
	return glossary.map((item) => {
		return {
			id: item.id,
			type: "glossary",
			payload: {
				title: item.term,
				link: item.pathname,
				createdAt: new Date(item.createdAt).getTime(),
			},
			score: 0,
		};
	});
}

export function sort(
	items: Array<ArticleItem | BookmarkItem | TutorialItem | GlossaryItem>,
) {
	return items.sort((a, b) => {
		if (a.score !== b.score) return a.score - b.score;
		return b.payload.createdAt - a.payload.createdAt;
	});
}
