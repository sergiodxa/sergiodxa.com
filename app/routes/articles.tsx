import { type Article } from "@prisma/client";
import { json, type LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { eachYearOfInterval } from "date-fns";
import { isEmpty } from "~/utils/arrays";

export async function loader({ context }: LoaderArgs) {
  let articles = await context!.db.article.findMany({
    where: { status: "published" },
    select: { title: true, slug: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  let articlesPerYear = articles.reduce(
    (articlesByYear, article) => {
      let year = article.createdAt.getFullYear().toString();
      if (!articlesByYear[year]) articlesByYear[year] = [];
      articlesByYear[year].push(article);
      return articlesByYear;
    },
    {} as {
      [year: string]: Pick<Article, "title" | "slug" | "createdAt">[];
    }
  );

  return json({
    articles: eachYearOfInterval({
      start: articles.at(-1)?.createdAt ?? new Date(),
      end: articles.at(0)?.createdAt ?? new Date(),
    })
      .map((date) => date.getUTCFullYear())
      .reverse()
      .map((year) => {
        let articles = articlesPerYear[year.toString()] ?? [];
        return { year, articles };
      }),
  });
}

export let handle: SDX.Handle = { hydrate: true };

export default function Articles() {
  let { articles } = useLoaderData<typeof loader>();

  return (
    <section>
      <h1>Articles</h1>
      <ul>
        {articles.map(({ year, articles }) => {
          if (isEmpty(articles ?? [])) return null;
          return (
            <li key={year}>
              <p>{year}</p>
              <ul>
                {articles.map((article) => {
                  return (
                    <li key={article.slug}>
                      <Link to={article.slug}>
                        <h1 className="text-xl">{article.title}</h1>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
