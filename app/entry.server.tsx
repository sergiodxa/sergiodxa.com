import type { EntryContext } from "@remix-run/cloudflare";

import { RemixServer } from "@remix-run/react";
import { createInstance } from "i18next";
import isbot from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { preloadLinkedAssets } from "remix-utils";

import { i18n } from "~/i18n.server";
import en from "~/locales/en";
import es from "~/locales/es";
import { measure } from "~/utils/measure";

export default function handleRequest(
	request: Request,
	status: number,
	headers: Headers,
	context: EntryContext
) {
	return measure("entry.server#handleRequest", async () => {
		let instance = createInstance().use(initReactI18next);

		let lng = await i18n.getLocale(request);
		let ns = i18n.getRouteNamespaces(context);

		await instance.init({
			supportedLngs: ["es", "en"],
			fallbackLng: "en",
			react: { useSuspense: false },
			lng,
			ns,
			resources: { en: { translation: en }, es: { translation: es } },
			interpolation: { escapeValue: false },
		});

		let body = await renderToReadableStream(
			<I18nextProvider i18n={instance}>
				<RemixServer context={context} url={request.url} />
			</I18nextProvider>,
			{
				onError(error) {
					console.error("renderToReadableStream error");
					console.error(error);
					status = 500;
				},
			}
		);

		if (isbot(request.headers.get("user-agent"))) {
			await body.allReady;
		}

		headers.set("Content-Type", "text/html");

		preloadLinkedAssets(context, headers);

		return new Response(body, { headers, status });
	});
}
