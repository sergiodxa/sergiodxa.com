import type { Content } from ".prisma/client";
import type { LoaderFunction } from "@remix-run/cloudflare";
import type { NoteVisibility } from "collected-notes";
import type { PublicUser } from "~/models/user.server";

import { redirect } from "@remix-run/cloudflare";
import matter from "gray-matter";
import { parameterize } from "inflected";

import { adminAuthorizer } from "~/services/auth.server";
import { cn, site } from "~/services/cn.server";
import { db } from "~/services/db.server";

import { ContentType, Visibility } from ".prisma/client";
import { getBookmarks } from "~/services/airtable.server";

function getPostVisibility(visibility: NoteVisibility): Visibility {
	switch (visibility) {
		case "public":
		case "public_site":
			return Visibility.PUBLIC;
		case "public_unlisted":
			return Visibility.DRAFT;
		case "private":
			return Visibility.PRIVATE;
		default:
			throw new Error(`Invalid visibility "${visibility}"`);
	}
}

async function migrateArticles(user: PublicUser) {
	let notes = (
		await Promise.all(
			Array.from({ length: 4 })
				.map((_, index) => index + 1)
				.map((page) => {
					return cn.latestNotes(site, page);
				})
		)
	).flat();

	await db.content.createMany({
		data: notes.map((note) => {
			let { content, data } = matter(note.body);
			let updatedAt = new Date(data.date ?? note.created_at);
			let canonicalUrl = data.canonical_url ?? "";
			let lang = data.lang ?? "en";
			let body = content.split("\n").slice(2).join("\n").trim();
			let headline = body.slice(0, body.indexOf("\n")).trim();

			return {
				visibility: getPostVisibility(note.visibility),
				type: ContentType.ARTICLE,
				slug: note.path,
				title: note.title,
				userId: user.id,
				body,
				lang,
				headline,
				updatedAt,
				createdAt: updatedAt,
				canonicalUrl,
			} as Content;
		}),
		skipDuplicates: true,
	});
}

async function migrateBookmarks(user: PublicUser) {
	let bookmarks = await getBookmarks();

	await db.content.createMany({
		data: bookmarks.map((bookmark) => {
			return {
				visibility: Visibility.PUBLIC,
				type: ContentType.BOOKMARK,
				slug: parameterize(bookmark.title),
				title: bookmark.title,
				userId: user.id,
				canonicalUrl: bookmark.url,
				lang: "en",
				createdAt: new Date(bookmark.createdAt),
				updatedAt: new Date(bookmark.createdAt),
			} as Content;
		}),
		skipDuplicates: true,
	});
}

export let loader: LoaderFunction = async (args) => {
	let user = await adminAuthorizer.authorize(args, {
		failureRedirect: "/",
		raise: "redirect",
	});

	await db.content.deleteMany();

	await Promise.all([migrateArticles(user), migrateBookmarks(user)]);

	return redirect("/");
};
