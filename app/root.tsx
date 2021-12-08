import nProgress from "nprogress";
import nProgressUrl from "nprogress/nprogress.css";
import { useEffect } from "react";
import {
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  Outlet,
  useCatch,
  useLoaderData,
  useTransition,
} from "remix";
import { useRemixI18Next } from "remix-i18next";
import { Document } from "~/components/document";
import { i18n } from "~/services/i18n.server";
import tailwindUrl from "~/styles/tailwind.css";

export let meta: MetaFunction = () => {
  return { title: "Sergio Xalambrí" };
};

export let links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindUrl },
    { rel: "stylesheet", href: nProgressUrl },
  ];
};

export let loader: LoaderFunction = async ({ request }) => {
  let locale = await i18n.getLocale(request);
  return json({ locale, i18n: await i18n.getTranslations(locale, "common") });
};

export default function App() {
  let { locale } = useLoaderData();
  useRemixI18Next(locale);

  let transition = useTransition();
  useEffect(() => {
    if (transition.state === "idle") nProgress.done();
    else nProgress.start();
  }, [transition.state]);

  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <Document title="Error!">
      <div>
        <h1>There was an error</h1>
        <p>{error.message}</p>
        <hr />
        <p>
          Hey, developer, you should replace this with what you want your users
          to see.
        </p>
      </div>
    </Document>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  let message;
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Oops! Looks like you tried to visit a page that you do not have access
          to.
        </p>
      );
      break;
    case 404:
      message = (
        <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      );
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <h1>
        {caught.status}: {caught.statusText}
      </h1>
      {message}
    </Document>
  );
}
