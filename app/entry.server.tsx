import { SSRProvider } from "@react-aria/ssr";
import "dotenv/config";
import { renderToString } from "react-dom/server";
import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { i18nextInit, RemixI18NextProvider } from "~/services/i18next";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  let markup = renderToString(
    <SSRProvider>
      <RemixI18NextProvider i18n={await i18nextInit()}>
        <RemixServer context={remixContext} url={request.url} />
      </RemixI18NextProvider>
    </SSRProvider>
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
