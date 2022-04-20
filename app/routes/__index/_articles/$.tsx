import { ContentType, Role } from "@prisma/client";
import { useTranslation } from "react-i18next";

import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { Form, Link, useLoaderData, useLocation } from "@remix-run/react";
import { notFound, redirectBack } from "remix-utils";
import invariant from "tiny-invariant";
import { adminAuthorizer, authenticator } from "~/services/auth.server";
import { db } from "~/services/db.server";
import { render } from "~/services/md.server";
import highlightStyles from "~/styles/highlight.css";

type LoaderData = {
  isAdmin: boolean;
  title: string;
  html: string;
  id: string;
};

export let meta: MetaFunction = ({ data }) => {
  let { title } = data as LoaderData;
  return { title };
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: highlightStyles }];
};

export let action: ActionFunction = async (args) => {
  await adminAuthorizer.authorize(args, {
    failureRedirect: "/articles",
    raise: "redirect",
  });

  let formData = await args.request.formData();
  let action = formData.get("_action");

  switch (action) {
    case "delete": {
      let id = formData.get("id");
      invariant(typeof id === "string", "id must be a string");
      await db.content.delete({ where: { id } });
      return redirect("/articles");
    }
    default: {
      return redirectBack(args.request, { fallback: "/articles" });
    }
  }
};

export let loader: LoaderFunction = async ({ request, params }) => {
  let user = await authenticator.isAuthenticated(request);

  let isAdmin = user?.role === Role.ADMIN;

  let slug = params["*"];
  invariant(slug, "Article slug is required");

  let article = await db.content.findFirst({
    select: { id: true, title: true, body: true },
    where: { slug, type: { equals: ContentType.ARTICLE } },
  });

  if (!article) throw notFound({ message: "Article not found" });

  let html = render(article.body ?? "");

  let headers = new Headers();
  headers.set("Cache-Control", "private, max-age=60");

  return json<LoaderData>(
    { isAdmin, id: article.id, title: article.title, html },
    { headers }
  );
};

export let handle = { id: "article-show" };

export default function Screen() {
  let { isAdmin, title, html, id } = useLoaderData<LoaderData>();
  let { t } = useTranslation();
  let location = useLocation();
  return (
    <main className="h-full overflow-y-auto w-full">
      {isAdmin && (
        <aside className="border-b border-gray-100 py-2 flex justify-end px-4 gap-x-4">
          <Link
            to={`write?id=${id}`}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t("Edit")}
          </Link>

          <Form action={location.pathname} method="post">
            <input type="hidden" name="_action" value="delete" />
            <input type="hidden" name="id" value={id} />
            <button className="inline-flex items-center px-2.5 py-1.5 border border-red-500 shadow-sm text-xs font-medium rounded text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              {t("Delete")}
            </button>
          </Form>
        </aside>
      )}

      <article className="prose prose-lg text-gray-500 mx-auto py-8 space-y-6">
        <h1>{title}</h1>
        <div className="contents" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </main>
  );
}
