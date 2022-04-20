import { ContentType, Visibility } from "@prisma/client";
import { singularize } from "inflected";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { notFound } from "remix-utils";
import invariant from "tiny-invariant";
import { db } from "~/services/db.server";
import { i18n } from "~/services/i18n.server";
import { render } from "~/services/md.server";

type LoaderData = {
  title: string | null;
  html: string;
  date: string;
  locale: string;
};

function isContentType(
  contentType: string
): asserts contentType is ContentType {
  let is = Object.values(ContentType).includes(contentType as ContentType);
  if (!is) throw new Error("Invalid content type");
}

export let loader: LoaderFunction = async ({ request, params }) => {
  let { contentType, "*": slug } = params;

  let locale = await i18n.getLocale(request);

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
    select: { id: true, title: true, body: true, updatedAt: true },
  });

  if (!content) throw notFound({ message: "Article not found" });

  let html = render(content.body ?? "");

  return json<LoaderData>({
    title: content.title,
    html,
    date: content.updatedAt.toISOString(),
    locale,
  });
};

export default function Screen() {
  let { title, html, date, locale } = useLoaderData();

  return (
    <main className="h-full overflow-y-auto w-full">
      <article className="prose lg:prose-lg text-gray-500 mx-auto py-8 px-3">
        <h1 className="prose-h1:mb-0">{title}</h1>
        <p className="text-sm">
          Last updated on{" "}
          <time dateTime={date}>
            {new Date(date).toLocaleDateString(locale, {
              year: "numeric",
              month: "long",
              day: "2-digit",
            })}
          </time>
        </p>
        <div className="contents" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </main>
  );
}
