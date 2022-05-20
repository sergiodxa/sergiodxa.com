import { parameterize } from "inflected";
import { z } from "zod";
import { createUseCase } from "~/use-case.server";

const MAX_HEADLINE_LENGTH = 140;
const ELLIPSIS = "…";

let schema = z.object({
  authorId: z.string().cuid(),
  title: z.string(),
  body: z.string(),
  slug: z.string().nullable().optional(),
  headline: z.string().nullable().optional(),
});

export default createUseCase({
  async validate(data) {
    return schema.parse({
      authorId: data.get("authorId"),
      title: data.get("title"),
      body: data.get("body"),
      slug: data.get("slug"),
      headline: data.get("headline"),
    });
  },

  async perform(
    { db },
    { authorId, title, body, slug = parameterize(title), headline }
  ) {
    let article = await db.article.create({
      data: {
        authorId,
        title,
        body,
        slug,
        headline: generarateHeadline(headline ?? body),
      },
    });

    return article;
  },
});

function generarateHeadline(string: string) {
  let headline = string.split("\n")[0];
  if (headline.length <= MAX_HEADLINE_LENGTH) return headline;
  return headline.slice(0, MAX_HEADLINE_LENGTH - 1) + ELLIPSIS;
}
