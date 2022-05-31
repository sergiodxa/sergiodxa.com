import { type Article } from "@prisma/client";
import { createUseCase } from "~/use-case.server";

export default createUseCase({
  async validate() {
    return null;
  },

  async perform({ db }) {
    let articles = await db.article.findMany({
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
