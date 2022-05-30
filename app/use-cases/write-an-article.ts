import { parameterize } from "inflected";
import { z } from "zod";
import { createCommand } from "~/use-case.server";

const MAX_HEADLINE_LENGTH = 140;
const ELLIPSIS = "…";

let schema = z.object({
  authorId: z.string().cuid(),
  title: z.string(),
  body: z.string(),
  slug: z.string().nullable().optional(),
  headline: z.string().nullable().optional(),
});

export default createCommand({
  async validate(formData) {
    return schema.parse({
      authorId: formData.get("authorId"),
      title: formData.get("title"),
      body: formData.get("body"),
      slug: formData.get("slug"),
      headline: formData.get("headline"),
    });
  },

  async perform({ db }, { authorId, title, body, slug, headline }) {
    headline = generarateHeadline(headline ?? body);
    slug ??= parameterize(title);

    let article = await db.article.create({
      data: { authorId, title, body, slug, headline },
    });

    return article;
  },
});

function generarateHeadline(string: string) {
  let headline = string.split("\n")[0];
  if (headline.length <= MAX_HEADLINE_LENGTH) return headline;
  return headline.slice(0, MAX_HEADLINE_LENGTH - 1) + ELLIPSIS;
}
