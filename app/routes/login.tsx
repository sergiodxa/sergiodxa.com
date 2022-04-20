import { useTranslation } from "react-i18next";
import { json, type LoaderFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { auth, returnToCookie } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/session.server";

type LoaderData = { error: string | null };

export let loader: LoaderFunction = async ({ request }) => {
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
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="bg-black/5 py-8 px-4 shadow sm:rounded-lg sm:px-10 w-full max-w-lg mx-auto space-y-8">
        <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
          {t("Sign in to your account")}
        </h2>

        <hr />

        <Form
          method="post"
          action="/auth/github"
          reloadDocument
          className="max-w-xs mx-auto"
        >
          <button
            type="submit"
            className="w-full inline-flex items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="text-center flex-grow">
              {t("Sign in with GitHub")}
            </span>
            <div className="w-5" />
          </button>
        </Form>
      </div>
    </div>
  );
}
