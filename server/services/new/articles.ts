import { CollectedNotes } from "~/server/repositories/collected-notes";

const SITE_PATH = "sergiodxa";

export class ArticlesService extends CollectedNotes {
	fetchArticles({ page = 1, query = "" }: { page?: number; query?: string }) {
		if (!query) {
			return this.request("GET /sites/:sitePath/notes", {
				variables: { params: { sitePath: SITE_PATH } },
			});
		}

		return this.request("GET /sites/:sitePath/notes/search", {
			variables: {
				params: { sitePath: SITE_PATH },
				search: { term: query, page },
			},
		});
	}

	fetchArticle({ path }: { path: string }) {
		return this.request("GET /:sitePath/:notePath", {
			variables: { params: { sitePath: SITE_PATH, notePath: path } },
		});
	}
}
