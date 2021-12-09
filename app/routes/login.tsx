import { useTranslation } from "react-i18next";
import { Form, LoaderFunction } from "remix";
import { GitHubIcon } from "~/components/icons";
import { authenticator } from "~/services/auth.server";

export let loader: LoaderFunction = ({ request }) => {
  return authenticator.isAuthenticated(request, { successRedirect: "/" });
};

export default function Screen() {
  let { t } = useTranslation();
  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-20 w-auto"
          src="https://github.com/sergiodxa.png"
          alt={t("Sergio Xalambrí")}
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t("Sign in to your account")}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form method="post" action="/auth/github" reloadDocument>
            <button
              type="submit"
              className="w-full inline-flex items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <GitHubIcon aria-aria-hidden className="mr-2 -ml-1 h-5 w-5" />
              <span className="text-center flex-grow">
                {t("Sign in with GitHub")}
              </span>
              <div className="w-5" />
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
