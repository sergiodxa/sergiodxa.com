import { Role } from "@prisma/client";
import { parameterize } from "inflected";
import { useTranslation } from "react-i18next";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
} from "remix";
import { json } from "remix-utils";
import invariant from "tiny-invariant";
import { Alert } from "~/components/alert";
import { Field } from "~/components/field";
import { Heading, Region } from "~/components/heading";
import { authenticator } from "~/services/auth.server";
import { db } from "~/services/db.server";

export let action: ActionFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/articles",
  });

  let isAdmin = user.role === Role.ADMIN;
  if (!isAdmin) return redirect("/articles");

  let formData = await request.formData();

  try {
    let title = formData.get("title");
    invariant(typeof title === "string", "title must be a string");
    invariant(title.trim().length > 0, "title can't be empty");

    let body = formData.get("body");
    invariant(typeof body === "string", "body must be a string");
    invariant(body.trim().length > 0, "body can't be empty");

    let headline = formData.get("headline") || body.slice(0, 140);
    invariant(typeof headline === "string", "headline must be a string");

    let slug = parameterize(title);

    await db.post.create({
      data: { slug, title, body, headline, userId: user.id },
    });

    return redirect(`/articles/${slug}`);
  } catch (error) {
    console.error(error);
    return { message: (error as Error).message };
  }
};

export let loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request);
  let isAdmin = user?.role === Role.ADMIN;
  if (!isAdmin) return redirect("/articles");
  return json({});
};

export default function Screen() {
  let result = useActionData<{ message: string }>();
  let { t } = useTranslation();

  return (
    <Region className="w-full">
      <Form method="post" className="max-w-prose mx-auto py-12 space-y-6">
        <Heading>{t("Create a new Article")}</Heading>

        {result?.message && <Alert type="danger" title={result.message} />}

        <Field>
          <Field.Label>{t("Title")}</Field.Label>
          <Field.Hint>{t("The title of the article.")}</Field.Hint>
          <Field.Input type="text" required minLength={1} name="title" />
        </Field>

        <Field>
          <Field.Label>{t("Headline")}</Field.Label>
          <Field.Hint>
            {t(
              "The headline of the article. It will default to the first 140 characters of the body."
            )}
          </Field.Hint>
          <Field.Textarea maxLength={140} name="headline" />
        </Field>

        <Field>
          <Field.Label>{t("Body")}</Field.Label>
          <Field.Hint>
            {t("The content of the article. You can use Markdown.")}
          </Field.Hint>
          <Field.Textarea required minLength={1} name="body" />
        </Field>

        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          {t("Create Article")}
        </button>
      </Form>
    </Region>
  );
}
