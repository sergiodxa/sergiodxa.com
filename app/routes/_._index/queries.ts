import { getDB } from "~/middleware/drizzle";
import { measure } from "~/middleware/server-timing";
import { Markdown } from "~/utils/markdown";
import type { UUID } from "~/utils/uuid";
import type { FeedItem } from "./types";

type Post = Awaited<ReturnType<typeof findAllPosts>>[number];

export async function queryFeed(query = ""): Promise<FeedItem[]> {
	let posts = await findAllPosts(query);
	return posts.map((it) => toFeedItem({ item: toFuseItem(it) }));
}

function findAllPosts(query = "") {
	let db = getDB();
	return measure("_._index.tsx#findAllPosts", () => {
		return db.query.posts.findMany({
			with: { meta: true },
			where(fields, operators) {
				const { sql, and } = operators;

				if (!query) return undefined;

				const exactMatch = query.match(/^"(.*)"$/)?.[1];
				const terms = exactMatch ? [exactMatch] : query.trim().split(/\s+/);

				const makeLike = (key: string) =>
					and(
						sql`post_meta.key = ${key}`,
						...terms.map((term) => sql`post_meta.value LIKE ${`%${term}%`}`),
					);

				return sql`
      EXISTS (
        SELECT 1 FROM post_meta
        WHERE post_meta.post_id = ${fields.id}
        AND (
          (
            ${fields.type} IN ('article', 'tutorial', 'like') AND (${makeLike("title")})
          )
          OR (
            ${fields.type} = 'glossary' AND (
              ${makeLike("term")} OR ${makeLike("definition")}
            )
          )
          OR (
            ${fields.type} IN ('article', 'tutorial') AND ${makeLike("content")}
          )
        )
      )
    `;
			},
			orderBy(fields, operators) {
				const { sql } = operators;

				// +3 if appears in title/term, +2 in definition, +1 in content
				return sql`
(
  SELECT
    MAX(
      CASE
        WHEN post_meta.key = 'title' AND post_meta.value LIKE ${`%${query}%`} THEN 3
        WHEN post_meta.key = 'term' AND post_meta.value LIKE ${`%${query}%`} THEN 3
        WHEN post_meta.key = 'definition' AND post_meta.value LIKE ${`%${query}%`} THEN 2
        WHEN post_meta.key = 'content' AND post_meta.value LIKE ${`%${query}%`} THEN 1
        ELSE 0
      END
    )
  FROM post_meta
  WHERE post_meta.post_id = ${fields.id}
) DESC,
${fields.createdAt} DESC
        `;
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
