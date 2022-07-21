import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { parameterize } from "inflected";
import { unauthorized } from "remix-utils";
import { z } from "zod";
import { auth } from "~/services/auth.server";

const MAX_HEADLINE_LENGTH = 140;
const ELLIPSIS = "…";

type LoaderData = null;

export let handle: SDX.Handle = { hydrate: true };

export async function loader({ request }: LoaderArgs) {
  await auth.isAuthenticated(request, { failureRedirect: "/login" });
  return json<LoaderData>(null);
}

export async function action({ request, context }: ActionArgs) {
  let userId = await auth.isAuthenticated(request);
  if (!userId) return unauthorized({ message: "Unauthorized" });

  let formData = await request.formData();

  let { authorId, title, body, slug, headline } = z
    .object({
      authorId: z.string().cuid(),
      title: z.string(),
      body: z.string(),
      slug: z.string().nullable().optional(),
      headline: z.string().nullable().optional(),
    })
    .parse({
      authorId: userId,
      title: formData.get("title"),
      body: formData.get("body"),
      slug: formData.get("slug"),
      headline: formData.get("headline"),
    });

  headline = generarateHeadline(headline ?? body);
  slug ??= parameterize(title);

  await context.db.article.create({
    data: { authorId, title, body, slug, headline, status: "draft" },
  });

  return redirect("/articles");

  function generarateHeadline(string: string) {
    let headline = string.split("\n")[0];
    if (headline.length <= MAX_HEADLINE_LENGTH) return headline;
    return headline.slice(0, MAX_HEADLINE_LENGTH - 1) + ELLIPSIS;
  }
}

export default function Write() {
  let error = useActionData<string>();

  return (
    <Form method="post">
      {error ? <p>{error}</p> : null}
      <input type="text" name="title" />
      <textarea name="body" />
      <button>Create</button>
    </Form>
  );
}
