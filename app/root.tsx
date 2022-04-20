import nProgressUrl from "nprogress/nprogress.css";
import {
  json,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { Outlet, useCatch, useLoaderData } from "@remix-run/react";
import { Document } from "~/components/document";
import { i18n } from "~/services/i18n.server";
import tailwindUrl from "~/styles/tailwind.css";
import { ErrorPage } from "./components/error";
import { useNProgress } from "./hooks/use-nprogress";
import { SDX } from "~/global";
import { useChangeLanguage } from "remix-i18next";

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
  return json({ locale });
};

export let handle: SDX.Handle = { i18n: ["translations"] };

export default function App() {
  let { locale } = useLoaderData();

  useChangeLanguage(locale);

  useNProgress();

  return (
    <Document locale={locale}>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <Document locale="en" title="Error!">
      <ErrorPage status={500} statusText="Unexpected error" />
    </Document>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  return (
    <Document locale="en" title={caught.statusText}>
      <ErrorPage status={caught.status} statusText={caught.statusText} />
    </Document>
  );
}
