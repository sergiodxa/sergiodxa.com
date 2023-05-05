import { CollectedNotes } from "~/repositories/collected-notes";

const SITE_PATH = "sdx-tutorials";

export class TutorialsService extends CollectedNotes {
	constructor(token: string, private sitePath: string) {
		super(token);
	}

	fetchTutorials({ page = 1, query = "" }: { page?: number; query?: string }) {
		if (!query) {
			return this.request("GET /sites/:sitePath/notes", {
				variables: { params: { sitePath: this.sitePath } },
			});
		}

		return this.request("GET /sites/:sitePath/notes/search", {
			variables: {
				params: { sitePath: this.sitePath },
				search: { term: query, page },
			},
		});
	}

	fetchArticle({ path }: { path: string }) {
		return this.request("GET /:sitePath/:notePath", {
			variables: { params: { sitePath: this.sitePath, notePath: path } },
		});
	}
}
