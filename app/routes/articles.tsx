import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { badRequest } from "remix-utils";
import { type SuccessValue } from "~/use-case.server";
import listArticlesPerYear from "~/use-cases/list-articles-per-year";

type LoaderData = {
  articlesByYear: SuccessValue<typeof listArticlesPerYear>;
};

export let loader: SDX.LoaderFunction = async ({ request, context }) => {
  let url = new URL(request.url);
  let result = await listArticlesPerYear(context, url.searchParams);

  if (listArticlesPerYear.isFailure(result)) return badRequest(result.error);
  let { value: articlesByYear } = result;

  return json<LoaderData>({ articlesByYear });
};

export default function Articles() {
  let { articlesByYear } = useLoaderData<LoaderData>();

  return (
    <section>
      <h1>Articles</h1>
      <ul>
        {Object.entries(articlesByYear).map(([year, articles]) => {
          return (
            <li key={year}>
              <p>{year}</p>
              <ul>
                {articles.map((article) => {
                  return <li key={article.id}>{article.title}</li>;
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
