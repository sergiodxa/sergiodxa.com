import { sql } from "drizzle-orm";
import { z } from "zod";
import type { Tutorial } from "~/entities/tutorial";
import { getDB } from "~/middleware/drizzle";
import { measure } from "~/middleware/server-timing";

export default async function findTutorialRecommendationsBySlug(
	slug: Tutorial["slug"],
) {
	let db = getDB();

	return measure("findTutorialRecommendationsBySlug", async () => {
		const { results } = await db.run(sql`
          WITH current AS (
            SELECT pm.post_id, p.type, pm_tags.value AS tag
            FROM post_meta pm
            JOIN post_meta pm_tags ON pm.post_id = pm_tags.post_id AND pm_tags.key = 'tags'
            JOIN posts p ON pm.post_id = p.id
            WHERE pm.key = 'slug' AND pm.value = ${slug}
          )
          SELECT
            p.id,
            slug_meta.value AS slug,
            title_meta.value AS title,
            tags_meta.value AS matchedTag
          FROM posts p
          JOIN post_meta tags_meta
            ON p.id = tags_meta.post_id AND tags_meta.key = 'tags'
          JOIN post_meta slug_meta
            ON p.id = slug_meta.post_id AND slug_meta.key = 'slug'
          JOIN post_meta title_meta
            ON p.id = title_meta.post_id AND title_meta.key = 'title'
          WHERE
            p.type = (SELECT type FROM current)
            AND p.id != (SELECT post_id FROM current)
            AND EXISTS (
              SELECT 1
              FROM current c
              WHERE
                SUBSTR(tags_meta.value, 1, INSTR(tags_meta.value, '@') - 1) =
                  SUBSTR(c.tag, 1, INSTR(c.tag, '@') - 1)
                AND tags_meta.value >= c.tag
            )
          LIMIT 3;
        `);
		return z
			.object({
				id: z.string().uuid(),
				slug: z.string(),
				title: z.string(),
				matchedTag: z.string(),
			})
			.array()
			.max(3)
			.parse(results);
	});
}
