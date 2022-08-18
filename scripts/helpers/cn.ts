import { collectedNotes, type Note } from "collected-notes";

import { CN_EMAIL, CN_TOKEN, CN_SITE } from "./env";

const cn = collectedNotes(CN_EMAIL, CN_TOKEN);

export async function downloadAllArticles() {
	let notes: Note[] = [];
	let page = 1;
	let loadMore = true;

	while (loadMore) {
		let moreNotes = await cn.latestNotes(CN_SITE, page, "public_site");

		notes.push(...moreNotes);

		if (moreNotes.length === 40) {
			page += 1;
			continue;
		} else loadMore = false;
	}

	return notes;
}
