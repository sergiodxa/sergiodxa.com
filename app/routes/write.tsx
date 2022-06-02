import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { badRequest, unauthorized } from "remix-utils";
import { auth } from "~/services/auth.server";
import writeAnArticle from "~/use-cases/write-an-article";

type LoaderData = null;

export let handle: SDX.Handle = { hydrate: true };

export let loader: SDX.LoaderFunction = async ({ request }) => {
  await auth.isAuthenticated(request, { failureRedirect: "/login" });
  return json<LoaderData>(null);
};

export let action: SDX.ActionFunction = async ({ request, context }) => {
  let userId = await auth.isAuthenticated(request);
  if (!userId) return unauthorized({ message: "Unauthorized" });
  let formData = await request.formData();
  formData.set("authorId", userId);
  let result = await writeAnArticle(
    {
      authorId: userId,
      title: formData.get("title") as string,
      body: formData.get("body") as string,
    },
    context
  );
  if (result.status === "failure") return badRequest(result.error.message);
  return redirect("/articles");
};

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
