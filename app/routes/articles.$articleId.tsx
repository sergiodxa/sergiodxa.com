import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { i18n } from "~/services/i18n.server";
import { type SuccessValue } from "~/use-case";
import { isFailure } from "~/use-case/result";
import readAnArticle from "~/use-cases/read-an-article";

type LoaderData = {
  article: NonNullable<SuccessValue<typeof readAnArticle>>;
};

export let loader: SDX.LoaderFunction = async ({
  request,
  params,
  context,
}) => {
  let result = await readAnArticle({ articleId: params.articleId }, context);

  if (isFailure(result)) throw result.error;

  let t = await i18n.getFixedT(request);

  if (result.value === null) {
    throw json({ message: t("Not found") }, { status: 404 });
  }

  return json<LoaderData>({ article: result.value });
};

export default function Article() {
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
