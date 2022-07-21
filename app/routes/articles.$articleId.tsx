import { type Article } from "@prisma/client";
import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { i18n } from "~/services/i18n.server";
import { pick } from "~/utils/objects";

type LoaderData = {
  article: Pick<Article, "title" | "headline" | "body">;
};

export async function loader({ request, params, context }: LoaderArgs) {
  let article = await context.db.article.findUnique({
    where: { slug: params.articleId },
  });

  let t = await i18n.getFixedT(request);

  if (!article) {
    throw json({ message: t("Not found") }, { status: 404 });
  }

  return json<LoaderData>({
    article: pick(article, ["title", "headline", "body"]),
  });
}

export default function Screen() {
  let { article } = useLoaderData<LoaderData>();
  return (
    <article className="prose mx-auto">
      <h1>{article.title}</h1>
      <p className="lead">{article.headline}</p>
      <div dangerouslySetInnerHTML={{ __html: article.body }} />
    </article>
  );
}

export function CatchBoundary() {
  return (
    <section>
      <h1>Article not found</h1>
    </section>
  );
}
