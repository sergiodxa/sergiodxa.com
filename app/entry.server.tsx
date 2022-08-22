import type { EntryContext } from "@remix-run/cloudflare";

import { RemixServer } from "@remix-run/react";
import { createInstance } from "i18next";
import { renderToString } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";

import en from "~/locales/en";
import es from "~/locales/es";
import { i18n } from "~/services/i18n.server";

export default async function handleRequest(
	request: Request,
	statusCode: number,
	headers: Headers,
	context: EntryContext
) {
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
	});

	let markup = renderToString(
		<I18nextProvider i18n={instance}>
			<RemixServer context={context} url={request.url} />
		</I18nextProvider>
	);

	headers.set("Content-Type", "text/html");

	return new Response("<!DOCTYPE html>" + markup, {
		status: statusCode,
		headers: headers,
	});
}
