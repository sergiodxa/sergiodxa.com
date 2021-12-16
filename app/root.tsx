import nProgressUrl from "nprogress/nprogress.css";
import {
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  Outlet,
  useCatch,
  useLoaderData,
} from "remix";
import { useRemixI18Next } from "remix-i18next";
import { Document } from "~/components/document";
import { i18n } from "~/services/i18n.server";
import tailwindUrl from "~/styles/tailwind.css";
import { ErrorPage } from "./components/error";
import { useNProgress } from "./hooks/use-nprogress";

export let meta: MetaFunction = () => {
  return { robots: "noindex", title: "Sergio Xalambrí" };
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

  useNProgress();

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
      <ErrorPage status={500} statusText="Unexpected error" />
    </Document>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  return (
    <Document title={caught.statusText}>
      <ErrorPage status={caught.status} statusText={caught.statusText} />
    </Document>
  );
}
