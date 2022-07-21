import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useCatch, useLoaderData } from "@remix-run/react";
import nProgressUrl from "nprogress/nprogress.css";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next";
import { i18n } from "~/services/i18n.server";
import tailwindUrl from "~/styles/tailwind.css";
import { Document } from "~/views/layouts/document";
import { useNProgress } from "./helpers/use-nprogress.hook";

export let meta: MetaFunction = () => {
  return { robots: "noindex", title: "Sergio Xalambrí" };
};

export let links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindUrl },
    { rel: "stylesheet", href: nProgressUrl },
  ];
};

export async function loader({ request }: LoaderArgs) {
  let locale = await i18n.getLocale(request);
  return json({ locale });
}

export let handle: SDX.Handle = { i18n: "translations" };

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
  if (process.env.NODE_ENV === "development") console.error(error);
  let { i18n } = useTranslation();

  return (
    <Document locale={i18n.language} title="Error!">
      Unexpected error
    </Document>
  );
}

export function CatchBoundary() {
  let caught = useCatch();
  let { i18n } = useTranslation();

  return (
    <Document locale={i18n.language} title={caught.statusText}>
      {caught.statusText}
    </Document>
  );
}
