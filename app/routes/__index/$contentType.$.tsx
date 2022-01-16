import { ContentType, Visibility } from "@prisma/client";
import { singularize } from "inflected";
import { json, LoaderFunction, useLoaderData } from "remix";
import { notFound } from "remix-utils";
import invariant from "tiny-invariant";
import { db } from "~/services/db.server";
import { render } from "~/services/md.server";

type LoaderData = { title: string | null; html: string };

function isContentType(
  contentType: string
): asserts contentType is ContentType {
  let is = Object.values(ContentType).includes(contentType as ContentType);
  if (!is) throw new Error("Invalid content type");
}

export let loader: LoaderFunction = async ({ request, params }) => {
  let { contentType, ["*"]: slug } = params;

  contentType = singularize(contentType?.toUpperCase() ?? "");
  invariant(contentType, "contentType is required");
  isContentType(contentType);

  invariant(slug, "slug is required");

  let content = await db.content.findFirst({
    where: {
      type: { equals: contentType },
      slug: { equals: slug },
      visibility: {
        in: [Visibility.PUBLIC, Visibility.PRIVATE],
      },
    },
    select: { id: true, title: true, body: true },
  });

  if (!content) throw notFound({ message: "Article not found" });

  let html = render(content.body ?? "");

  return json<LoaderData>({ title: content.title, html });
};

export default function Screen() {
  let { title, html } = useLoaderData();

  return (
    <main className="h-full overflow-y-auto w-full">
      <article className="prose prose-lg text-gray-500 mx-auto py-8 px-3 space-y-6">
        <h1>{title}</h1>
        <div className="contents" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </main>
  );
}
