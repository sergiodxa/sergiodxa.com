import { useTranslation } from "react-i18next";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import invariant from "tiny-invariant";
import { Alert } from "~/components/alert";
import { Field } from "~/components/field";
import { GitHubIcon } from "~/components/icons";
import { signup } from "~/models/user.server";
import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/session.server";

type LoaderData = { error: string | null };
type ActionData = { error: string | null };

export let action: ActionFunction = async ({ request }) => {
  let form = await request.formData();

  let email = form.get("email");
  let password = form.get("password");
  let displayName = form.get("displayName");

  let session = await getSession(request);

  try {
    invariant(typeof email === "string", "email must be a string");
    invariant(typeof password === "string", "password must be a string");
    invariant(typeof displayName === "string", "displayName must be a string");

    let user = await signup({ email, displayName, password });

    session.set(authenticator.sessionKey, user);

    let headers = new Headers({ "Set-Cookie": await commitSession(session) });

    return redirect("/", { headers });
  } catch (error) {
    if (error instanceof Error) {
      return json<ActionData>({ error: error.message });
    }
    throw error;
  }
};

export let loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, { successRedirect: "/" });
  let session = await getSession(request);
  let error = session.get("auth:error") as string | null;
  let headers = new Headers({ "Set-Cookie": await commitSession(session) });
  return json<LoaderData>({ error }, { headers });
};

export default function Screen() {
  let { t } = useTranslation();
  let { error } = useLoaderData<LoaderData>();
  let action = useActionData<ActionData>();

  return (
    <div className="min-h-full bg-gradient-to-br from-rose-500 via-lime-500 to-sky-500 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="bg-white/40 py-8 px-4 shadow sm:rounded-lg sm:px-10 w-full max-w-lg mx-auto space-y-8">
        <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
          {t("Sign in to your account")}
        </h2>

        {Boolean(error) && <Alert type="danger" title={error?.message} />}
        {Boolean(action?.error) && <Alert type="danger" title={action.error} />}

        <Form method="post" reloadDocument className="max-w-xs mx-auto">
          <Field>
            <Field.Label>{t("Username")}</Field.Label>
            <Field.Input
              type="text"
              name="displayName"
              defaultValue="sergiodxa"
            />
          </Field>

          <Field>
            <Field.Label>{t("Email")}</Field.Label>
            <Field.Input
              type="email"
              name="email"
              defaultValue="hello@sergiodxa.com"
            />
          </Field>

          <Field>
            <Field.Label>{t("Password")}</Field.Label>
            <Field.Input
              type="password"
              name="password"
              defaultValue="abc123!@#"
            />
          </Field>

          <button>{t("Sign In")}</button>
        </Form>

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
