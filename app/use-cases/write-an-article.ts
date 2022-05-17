import { parameterize } from "inflected";
import { createUseCase } from "~/use-case.server";

const MAX_HEADLINE_LENGTH = 140;
const ELLIPSIS = "…";

export default createUseCase({
  schema(z) {
    return z.object({
      authorId: z.string().cuid(),
      title: z.string(),
      body: z.string(),
      slug: z.string().nullable().optional(),
      headline: z.string().nullable().optional(),
    });
  },

  async perform(
    context,
    { authorId, title, body, slug = parameterize(title), headline }
  ) {
    let article = await context.db.article.create({
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
