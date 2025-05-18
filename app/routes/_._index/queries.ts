import Fuse, { type FuseResult } from "fuse.js";
import { getDB } from "~/middleware/drizzle";
import { measure } from "~/middleware/server-timing";
import { Markdown } from "~/utils/markdown";
import type { UUID } from "~/utils/uuid";
import type { FeedItem } from "./types";

type Post = Awaited<ReturnType<typeof findAllPosts>>[number];
type FuseItem = Awaited<ReturnType<typeof toFuseItem>>;

export async function queryFeed(query = ""): Promise<FeedItem[]> {
	let posts = await findAllPosts();

	if (!query) return posts.map((it) => toFeedItem({ item: toFuseItem(it) }));

	return new Fuse(posts.map(toFuseItem), {
		keys: ["title", "content"],
		includeScore: true,
		findAllMatches: false,
		useExtendedSearch: true,
		isCaseSensitive: false,
	})
		.search(query.trim().toLowerCase())
		.sort(sortResult)
		.map(toFeedItem);
}

function findAllPosts() {
	let db = getDB();
	return measure("_._index", "_._index.tsx#findAllPosts", () => {
		return db.query.posts.findMany({
			with: { meta: true },
			orderBy(fields, operators) {
				return operators.desc(fields.createdAt);
			},
		});
	});
}

function getLink(post: Post) {
	if (post.type === "article") {
		let slug = post.meta.find((it) => it.key === "slug")?.value;
		if (!slug) throw new Error(`The article ${post.id} has no slug`);
		return `/articles/${slug}`;
	}

	if (post.type === "tutorial") {
		let slug = post.meta.find((it) => it.key === "slug")?.value;
		if (!slug) throw new Error(`The tutorial ${post.id} has no slug`);
		return `/tutorials/${slug}`;
	}

	if (post.type === "glossary") {
		let slug = post.meta.find((it) => it.key === "slug")?.value;
		if (!slug) throw new Error(`The glossary ${post.id} has no slug`);
		return `/glossary#${slug}`;
	}

	if (post.type === "like") {
		let url = post.meta.find((it) => it.key === "url")?.value;
		if (!url) throw new Error(`The like ${post.id} has no url`);
		return url;
	}

	throw new Error(`Failed to get post link. Invalid post type ${post.type}`);
}

function getTitle(post: Post) {
	if (post.type === "glossary") {
		return post.meta.find((it) => it.key === "term")?.value ?? "";
	}

	return post.meta.find((it) => it.key === "title")?.value ?? "";
}

function getContent(post: Post) {
	if (post.type === "article" || post.type === "tutorial") {
		return Markdown.plain(
			post.meta.find((it) => it.key === "content")?.value ?? "",
		);
	}

	if (post.type === "glossary") {
		return post.meta.find((it) => it.key === "definition")?.value ?? "";
	}

	return "";
}

function sortResult(a: FuseResult<FuseItem>, b: FuseResult<FuseItem>) {
	if (a.score !== b.score) return (a.score ?? 0) - (b.score ?? 0);
	return b.item.createdAt.getTime() - a.item.createdAt.getTime();
}

function toFuseItem(post: Post) {
	return {
		id: post.id,
		type: post.type,
		link: getLink(post),
		title: getTitle(post),
		content: getContent(post),
		createdAt: post.createdAt,
	};
}

function toFeedItem({
	item,
}: {
	item: {
		id: UUID;
		type: "like" | "tutorial" | "article" | "comment" | "glossary";
		link: string;
		title: string;
		content: string;
		createdAt: Date;
	};
}): FeedItem {
	return {
		id: item.id,
		type: item.type,
		payload: {
			title: item.title,
			link: item.link,
			createdAt: item.createdAt,
		},
	};
}
