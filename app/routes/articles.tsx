import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { badRequest } from "remix-utils";
import { articleModel, type Article } from "~/models/article.server";
import listPaginatedArticles from "~/use-cases/list-paginated-articles";

type LoaderData = {
  articles: Array<Pick<Article, "id" | "title" | "slug">>;
};

export let loader: SDX.LoaderFunction = async ({ request, context }) => {
  let url = new URL(request.url);
  let result = await listPaginatedArticles(context, url.searchParams);

  if (result.status === "failure") throw badRequest(result.error);
  let { value: articles } = result;

  let schema = articleModel.pick({ id: true, title: true, slug: true });

  return json<LoaderData>({
    articles: articles.map((article) => schema.parse(article)),
  });
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
