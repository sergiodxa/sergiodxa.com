import { SSRProvider } from "@react-aria/ssr";
import { RemixServer } from "@remix-run/react";
import type { EntryContext } from "@remix-run/server-runtime";
import { createInstance } from "i18next";
import Backend from "i18next-fs-backend";
import { resolve } from "node:path";
import { renderToString } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { i18n } from "~/services/i18n.server";
import "dotenv/config";

export default async function handleRequest(
  request: Request,
  statusCode: number,
  headers: Headers,
  context: EntryContext
) {
  let instance = createInstance();

  let lng = await i18n.getLocale(request);
  let ns = i18n.getRouteNamespaces(context);

  await instance
    .use(initReactI18next)
    .use(Backend)
    .init({
      supportedLngs: ["es", "en"],
      defaultNS: "common",
      fallbackLng: "en",
      react: { useSuspense: false },
      lng,
      ns,
      backend: { loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json") },
    });

  // Then you can render your app wrapped in the I18nextProvider as in the
  // entry.client file
  let markup = renderToString(
    <I18nextProvider i18n={instance}>
      <SSRProvider>
        <RemixServer context={context} url={request.url} />
      </SSRProvider>
    </I18nextProvider>
  );

  headers.set("Content-Type", "text/html");

  return new Response("<!DOCTYPE html>" + markup, {
    status: statusCode,
    headers: headers,
  });
}
