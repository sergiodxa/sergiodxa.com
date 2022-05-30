import { type Article } from "@prisma/client";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { badRequest } from "remix-utils";
import listPaginatedArticles from "~/use-cases/list-paginated-articles";

type LoaderData = { articles: Pick<Article, "id" | "title" | "slug">[] };

export let loader: SDX.LoaderFunction = async ({ request, context }) => {
  let url = new URL(request.url);
  let result = await listPaginatedArticles(context, url.searchParams);

  if (listPaginatedArticles.isFailure(result)) return badRequest(result.error);
  let { value: articles } = result;

  return json<LoaderData>({ articles });
};

export default function Articles() {
  let { articles } = useLoaderData<LoaderData>();

  return (
    <section>
      <h1>Articles</h1>
      <ul>
        {articles.map((article) => {
          return <li key={article.id}>{article.title}</li>;
        })}
      </ul>
    </section>
  );
}
