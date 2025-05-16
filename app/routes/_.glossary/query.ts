import { getDB } from "~/middleware/drizzle";
import { getLocale } from "~/middleware/i18next";
import { Glossary } from "~/models/glossary.server";

export async function queryGlossary() {
	let locale = getLocale();
	let db = getDB();

	let glossary = await Glossary.list({ db });
	return glossary
		.sort((a, b) => a.term.localeCompare(b.term, locale))
		.map((item) => {
			return {
				id: item.id,
				slug: item.slug,
				title: item.title,
				term: item.term,
				definition: item.definition,
			};
		});
}
