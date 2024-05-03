import type {
	AppLoadContext,
	EntryContext,
	HandleErrorFunction,
} from "@remix-run/cloudflare";

import { RemixServer, isRouteErrorResponse } from "@remix-run/react";
import { isErrorResponse } from "@remix-run/react/dist/data";
import { createInstance } from "i18next";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { preloadLinkedAssets } from "remix-utils/preload-route-assets";

import en from "~/locales/en";
import es from "~/locales/es";
import { I18n } from "~/modules/i18n.server";

export default async function handleRequest(
	request: Request,
	status: number,
	headers: Headers,
	context: EntryContext,
	{ time }: AppLoadContext,
) {
	let instance = await time("setup-i18next", async () => {
		let instance = createInstance().use(initReactI18next);

		let i18n = new I18n();
		let lng = await i18n.getLocale(request);

		await instance.init({
			supportedLngs: ["es", "en"],
			fallbackLng: "en",
			react: { useSuspense: false },
			lng,
			ns: ["translation"],
			resources: { en: { translation: en }, es: { translation: es } },
			interpolation: { escapeValue: false },
		});

		return instance;
	});

	let body = await time("start-rendering", async () => {
		let body = await renderToReadableStream(
			<I18nextProvider i18n={instance}>
				<RemixServer context={context} url={request.url} />
			</I18nextProvider>,
			{
				onError(error) {
					console.error("renderToReadableStream error");
					console.error(error);
					// biome-ignore lint/style/noParameterAssign: It's ok
					status = 500;
				},
			},
		);

		if (isbot(request.headers.get("user-agent"))) await body.allReady;

		return body;
	});

	headers.set("Content-Type", "text/html");

	await time("preload-linked-asssets", async () => {
		return preloadLinkedAssets(context, headers);
	});

	return new Response(body, { headers, status });
}

export const handleError: HandleErrorFunction = async (error, { request }) => {
	if (request.signal.aborted) return;
	if (isErrorResponse(error)) return;
	if (isRouteErrorResponse(error)) return console.error(error);
	console.error(error);
};
