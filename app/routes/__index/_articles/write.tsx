import { Content, ContentType, Visibility } from "@prisma/client";
import { parameterize } from "inflected";
import { Trans, useTranslation } from "react-i18next";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Alert } from "~/components/alert";
import { Field } from "~/components/field";
import { Heading, Region } from "~/components/heading";
import { adminAuthorizer } from "~/services/auth.server";
import { db } from "~/services/db.server";

type LoaderData = {
  article: Content | null;
};

export let action: ActionFunction = async (args) => {
  let user = await adminAuthorizer.authorize(args, {
    failureRedirect: "/articles",
    raise: "redirect",
  });

  let formData = await args.request.formData();

  let url = new URL(args.request.url);
  let id = url.searchParams.get("id");

  try {
    let action = formData.get("action");
    invariant(action === "upsert" || action === "publish", "Invalid action");

    let visibility =
      action === "publish" ? Visibility.PUBLIC : Visibility.DRAFT;

    let title = formData.get("title");
    invariant(typeof title === "string", "title must be a string");
    invariant(title.trim().length > 0, "title can't be empty");

    let body = formData.get("body");
    invariant(typeof body === "string", "body must be a string");
    invariant(body.trim().length > 0, "body can't be empty");

    let headline = formData.get("headline") || body.slice(0, 140);
    invariant(typeof headline === "string", "headline must be a string");

    let slug = parameterize(title);

    await db.content.upsert({
      where: { id: id ?? undefined, slug },
      create: {
        slug,
        title,
        body,
        headline,
        userId: user.id,
        visibility,
        type: ContentType.ARTICLE,
      },
      update: { title, body, headline, visibility },
    });

    return redirect(`/articles/${slug}`);
  } catch (error) {
    console.error(error);
    return { message: (error as Error).message };
  }
};

export let loader: LoaderFunction = async (args) => {
  await adminAuthorizer.authorize(args, {
    failureRedirect: "/articles",
    raise: "redirect",
  });

  let url = new URL(args.request.url);
  let id = url.searchParams.get("id");

  if (!id) return json<LoaderData>({ article: null });

  let article = await db.content.findUnique({
    where: { id },
  });

  if (!article) return json<LoaderData>({ article: null });

  return json<LoaderData>({ article });
};

export default function Screen() {
  let { article } = useLoaderData<LoaderData>();
  let result = useActionData<{ message: string }>();
  let { t } = useTranslation();

  return (
    <Region className="w-full">
      <Form method="post" className="max-w-prose mx-auto py-12 space-y-6">
        {article === null ? (
          <Heading>{t("Create a new Article")}</Heading>
        ) : (
          <Heading>
            <Trans
              defaults='Update "<strong>{{title}}</strong>"'
              values={article}
              components={{ strong: <strong /> }}
            />
          </Heading>
        )}

        {result?.message && <Alert type="danger" title={result.message} />}

        <Field>
          <Field.Label>{t("Title")}</Field.Label>
          <Field.Hint>{t("The title of the article.")}</Field.Hint>
          <Field.Input
            type="text"
            required
            minLength={1}
            name="title"
            defaultValue={article?.title}
          />
        </Field>

        <Field>
          <Field.Label>{t("Headline")}</Field.Label>
          <Field.Hint>
            {t(
              "The headline of the article. It will default to the first 140 characters of the body."
            )}
          </Field.Hint>
          <Field.Textarea
            maxLength={140}
            rows={5}
            name="headline"
            defaultValue={article?.headline ?? ""}
          />
        </Field>

        <Field>
          <Field.Label>{t("Body")}</Field.Label>
          <Field.Hint>
            {t("The content of the article. You can use Markdown.")}
          </Field.Hint>
          <Field.Textarea
            required
            minLength={1}
            rows={15}
            name="body"
            defaultValue={article?.body ?? ""}
          />
        </Field>

        <footer className="flex gap-x-4 justify-end items-center">
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            name="action"
            value="upsert"
          >
            {article === null ? t("Create") : t("Update")}
          </button>

          {article?.visibility === Visibility.DRAFT && (
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              name="action"
              value="publish"
            >
              {t("Publish")}
            </button>
          )}
        </footer>
      </Form>
    </Region>
  );
}
