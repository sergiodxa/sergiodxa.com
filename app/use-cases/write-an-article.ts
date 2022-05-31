import { type Article } from "@prisma/client";
import { parameterize } from "inflected";
import { z } from "zod";
import { define } from "~/use-case";

const MAX_HEADLINE_LENGTH = 140;
const ELLIPSIS = "…";

let schema = z.object({
  authorId: z.string().cuid(),
  title: z.string(),
  body: z.string(),
  slug: z.string().nullable().optional(),
  headline: z.string().nullable().optional(),
});

export default define<z.infer<typeof schema>, Article>({
  async validate({ authorId, title, body, slug, headline }) {
    return schema.parse({ authorId, title, body, slug, headline });
  },

  async execute({ input: { authorId, title, body, slug, headline }, context }) {
    headline = generarateHeadline(headline ?? body);
    slug ??= parameterize(title);

    let article = await context.db.article.create({
      data: { authorId, title, body, slug, headline, status: "draft" },
    });

    return article;
  },
});

function generarateHeadline(string: string) {
  let headline = string.split("\n")[0];
  if (headline.length <= MAX_HEADLINE_LENGTH) return headline;
  return headline.slice(0, MAX_HEADLINE_LENGTH - 1) + ELLIPSIS;
}
