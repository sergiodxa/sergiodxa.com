import { useTranslation } from "react-i18next";
import { Form, json, LoaderFunction, useLoaderData } from "remix";
import { Alert } from "~/components/alert";
import { GitHubIcon } from "~/components/icons";
import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/session.server";

type LoaderData = { error: string | null; magicLinkSent: boolean };

export let loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, { successRedirect: "/" });
  let session = await getSession(request);

  let error = session.get("auth:error") as string | null;
  let magicLinkSent = session.has("auth:magiclink");

  let headers = new Headers({ "Set-Cookie": await commitSession(session) });

  return json<LoaderData>({ error, magicLinkSent }, { headers });
};

export default function Screen() {
  let { t } = useTranslation();
  let { error, magicLinkSent } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="bg-black/5 py-8 px-4 shadow sm:rounded-lg sm:px-10 w-full max-w-lg mx-auto space-y-8">
        <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
          {t("Sign in to your account")}
        </h2>

        {Boolean(error) && <Alert type="danger" title={error?.message} />}
        {/* {magicLinkSent && (
          <Alert
            type="success"
            title="Check your email"
            body="An email with a link was sent to your email, click it to complete the login."
          />
        )} */}

        {/* <Form
          method="post"
          action="/auth/form"
          reloadDocument
          className="max-w-sm mx-auto flex flex-col gap-4"
        >
          <Field>
            <Field.Label>{t("Email")}</Field.Label>
            <Field.Input type="email" name="email" required minLength={3} />
          </Field>

          <Field>
            <Field.Label>{t("Password")}</Field.Label>
            <Field.Hint>
              {t("If you have a password, write it here.")}
            </Field.Hint>
            <Field.Input
              type="password"
              name="password"
              autoComplete="current-password"
            />
          </Field>

          <div className="flex gap-4">
            <button className="w-full inline-flex items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              {t("Sign In with Password")}
            </button>

            <button
              formAction="/auth/email-link"
              className="w-full inline-flex items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              {t("Sign In with Email")}
            </button>
          </div>
        </Form> */}

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
            <GitHubIcon aria-hidden className="mr-2 -ml-1 h-5 w-5" />
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
