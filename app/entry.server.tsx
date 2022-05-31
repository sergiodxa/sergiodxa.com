import { SSRProvider } from "@react-aria/ssr";
import {
  type EntryContext,
  type HandleDataRequestFunction,
} from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import "dotenv/config";
import etag from "etag";
import { createInstance } from "i18next";
import Backend from "i18next-fs-backend";
import { resolve } from "node:path";
import { renderToString } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { notModified } from "remix-utils";
import { i18n } from "~/services/i18n.server";

export default async function handleRequest(
  request: Request,
  statusCode: number,
  headers: Headers,
  context: EntryContext
) {
  let instance = createInstance().use(initReactI18next).use(Backend);

  let lng = await i18n.getLocale(request);
  let ns = i18n.getRouteNamespaces(context);

  await instance.init({
    supportedLngs: ["es", "en"],
    defaultNS: "translations",
    fallbackLng: "en",
    react: { useSuspense: false },
    lng,
    ns,
    backend: { loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json") },
  });

  let markup = renderToString(
    <I18nextProvider i18n={instance}>
      <SSRProvider>
        <RemixServer context={context} url={request.url} />
      </SSRProvider>
    </I18nextProvider>
  );

  headers.set("ETag", etag(markup));
  headers.set("Content-Type", "text/html");

  if (request.headers.get("If-None-Match") === headers.get("ETag")) {
    return notModified({ headers });
  }

  return new Response("<!DOCTYPE html>" + markup, {
    status: statusCode,
    headers: headers,
  });
}

export let handleDataRequest: HandleDataRequestFunction = async (
  response: Response,
  { request }
) => {
  if (request.method.toLowerCase() === "get") {
    response.headers.set("ETag", etag(await response.clone().text()));
    if (request.headers.get("If-None-Match") === response.headers.get("ETag")) {
      return notModified({ headers: response.headers });
    }
  }

  return response;
};
