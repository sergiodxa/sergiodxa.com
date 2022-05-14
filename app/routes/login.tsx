import { useTranslation } from "react-i18next";
import { json } from "@remix-run/node";
import { Form } from "@remix-run/react";
import {
  auth,
  returnToCookie,
  commitSession,
  getSession,
} from "~/services/auth.server";

type LoaderData = { error: string | null };

export let loader: SDX.LoaderFunction = async ({ request }) => {
  await auth.isAuthenticated(request, { successRedirect: "/" });

  let headers = new Headers();

  let url = new URL(request.url);

  let returnTo = url.searchParams.get("returnTo") ?? "/";
  headers.append("Set-Cookie", await returnToCookie.serialize(returnTo));

  let session = await getSession(request);
  let error = session.get("auth:error") as { message: string } | null;
  headers.append("Set-Cookie", await commitSession(session));

  return json<LoaderData>({ error: error?.message ?? null }, { headers });
};

export default function Screen() {
  let { t } = useTranslation();

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg space-y-8 bg-black/5 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
          {t("Sign in to your account")}
        </h2>

        <hr />

        <Form
          method="post"
          action="/auth/github"
          reloadDocument
          className="mx-auto max-w-xs"
        >
          <button
            type="submit"
            className="inline-flex w-full items-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
          >
            <span className="flex-grow text-center">
              {t("Sign in with GitHub")}
            </span>
            <div className="w-5" />
          </button>
        </Form>
      </div>
    </div>
  );
}
