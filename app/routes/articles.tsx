import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { badRequest } from "remix-utils";
import { type SuccessValue } from "~/use-case";
import { isFailure } from "~/use-case/result";
import listArticlesPerYear from "~/use-cases/list-articles-per-year";

type LoaderData = {
  articlesPerYear: SuccessValue<typeof listArticlesPerYear>;
};

export let loader: SDX.LoaderFunction = async ({ context }) => {
  let result = await listArticlesPerYear({}, context);

  if (isFailure(result)) return badRequest(result.error);
  let { value: articlesPerYear } = result;

  return json<LoaderData>({ articlesPerYear });
};

export default function Articles() {
  let { articlesPerYear } = useLoaderData<LoaderData>();

  return (
    <section>
      <h1>Articles</h1>
      <ul>
        {Object.entries(articlesPerYear).map(([year, articles]) => {
          return (
            <li key={year}>
              <p>{year}</p>
              <ul>
                {articles.map((article) => {
                  return (
                    <li key={article.id}>
                      <Link to={article.id}>{article.title}</Link>
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
