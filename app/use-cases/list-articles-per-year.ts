import { type Article } from "@prisma/client";
import { define, type EmptyInput } from "~/use-case";

export default define<
  EmptyInput,
  { [year: string]: Pick<Article, "id" | "title" | "slug" | "createdAt">[] }
>({
  async validate() {
    return null;
  },

  async execute({ context }) {
    let articles = await context.db.article.findMany({
      where: { status: "published" },
      select: { id: true, title: true, slug: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return articles.reduce(
      (articlesByYear, article) => {
        let year = article.createdAt.getFullYear().toString();
        if (!articlesByYear[year]) articlesByYear[year] = [];
        articlesByYear[year].push(article);
        return articlesByYear;
      },
      {} as {
        [year: string]: Pick<Article, "id" | "title" | "slug" | "createdAt">[];
      }
    );
  },
});
