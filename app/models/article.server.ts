import { z } from "zod";

export type Article = z.infer<typeof articleModel>;
export type ArticleStatus = z.infer<typeof articleStatus>;

export let articleStatus = z.union([
  z.literal("draft"),
  z.literal("published"),
]);

export let articleModel = z.object({
  id: z.string().cuid(),
  status: articleStatus.default("draft"),
  lang: z.string().default("en"),
  slug: z.string(),
  title: z.string(),
  headline: z.string().nullable(),
  body: z.string().nullable(),
  canonicalUrl: z.string().nullable(),
  userId: z.string().cuid(),
  updatedAt: z.date(),
  createdAt: z.date().default(() => new Date()),
});
