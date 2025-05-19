import { TutorialSchema } from "~/entities/tutorial";
import type { Tutorial } from "~/entities/tutorial";
import { getDB } from "~/middleware/drizzle";
import { measure } from "~/middleware/server-timing";

export default async function findTutorialBySlug(
	slug: Tutorial["slug"],
): Promise<Tutorial> {
	let db = getDB();

	let result = await measure("findTutorialBySlug", () => {
		return db.query.postMeta.findFirst({
			with: { post: { with: { meta: true, author: true } } },
			where(fields, { and, eq }) {
				return and(eq(fields.key, "slug"), eq(fields.value, slug));
			},
		});
	});

	if (!result) throw new Error(`Couldn't find tutorial with slug ${slug}`);

	return TutorialSchema.parse({
		id: result.postId,
		authorId: result.post.authorId,
		type: result.post.type,
		createdAt: result.post.createdAt,
		updatedAt: result.post.updatedAt,
		author: {
			id: result.post.author.id,
			role: result.post.author.role,
			email: result.post.author.email,
			username: result.post.author.username,
			displayName: result.post.author.displayName,
			avatar: result.post.author.avatar,
			createdAt: result.post.author.createdAt,
			updatedAt: result.post.author.updatedAt,
		},
		title: result.post.meta.find((m) => m.key === "title")?.value,
		slug: result.post.meta.find((m) => m.key === "slug")?.value,
		excerpt: result.post.meta.find((m) => m.key === "excerpt")?.value,
		content: result.post.meta.find((m) => m.key === "content")?.value,
		tags: result.post.meta.filter((m) => m.key === "tags").map((m) => m.value),
	});
}
