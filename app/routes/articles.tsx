import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { articleModel, type Article } from "~/models/article.server";

type LoaderData = {
  articles: Array<Pick<Article, "id" | "title" | "slug">>;
};

export let loader: SDX.LoaderFunction = async ({ context }) => {
  let articles = await context.db.article.findMany({
    where: { status: "published" },
    select: { id: true, title: true, slug: true },
  });

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
