import { createUseCase } from "~/use-case.server";
import { parameterize } from "inflected";

export default createUseCase({
  schema(z) {
    return z.object({
      authorId: z.string().cuid(),
      title: z.string(),
      body: z.string(),
      slug: z.string().nullable().optional(),
      headlines: z.string().nullable().optional(),
    });
  },

  async perform(
    context,
    {
      authorId,
      title,
      body,
      slug = parameterize(title),
      headline = generarateHeadline(body),
    }
  ) {
    context.logger.info("Write an article", {
      authorId,
      title,
      body,
      slug,
      headline,
    });

    let article = await context.db.article.create({
      data: { authorId, title, body, slug, headline },
    });

    return article;
  },
});

function generarateHeadline(body: string) {
  let headline = body.split("\n")[0];
  if (headline.length <= 140) return headline;
  return headline.slice(0, 139) + "…";
}
