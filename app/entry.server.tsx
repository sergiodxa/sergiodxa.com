import type { EntryContext } from "@remix-run/cloudflare";

import { RemixServer } from "@remix-run/react";
import { createInstance } from "i18next";
import { renderToString } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";

import en from "~/locales/en";
import es from "~/locales/es";
import { i18n } from "~/services/i18n.server";

import { measure } from "./utils/measure";

export default function handleRequest(
	request: Request,
	statusCode: number,
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

		let markup = renderToString(
			<I18nextProvider i18n={instance}>
				<RemixServer context={context} url={request.url} />
			</I18nextProvider>
		);

		headers.set("Content-Type", "text/html");

		prefetchAssets(context, headers);

		return new Response("<!DOCTYPE html>" + markup, {
			status: statusCode,
			headers: headers,
		});
	});
}

function prefetchAssets(context: EntryContext, headers: Headers) {
	let links = context.matches
		.flatMap((match) => {
			let route = context.routeModules[match.route.id];
			if (route.links instanceof Function) return route.links();
			return [];
		})
		.map((link) => {
			if ("as" in link && "href" in link) {
				return { href: link.href, as: link.as } as const;
			}
			if ("rel" in link && "href" in link) {
				if (link.rel === "stylesheet")
					return { href: link.href, as: "style" } as const;
			}
			return null;
		})
		.filter(isLink);

	links = removeDuplicatesByKey(links, "href");

	for (let link of links) {
		headers.append("Link", `<${link.href}>; rel=preload; as=${link.as}`);
	}
}

function removeDuplicatesByKey<Value>(
	list: Value[],
	key: keyof Value
): Value[] {
	return list.filter((item, index, self) => {
		return (
			index ===
			self.findIndex((t) => {
				return t[key] === item[key];
			})
		);
	});
}

function isLink(link: any): link is { href: string; as: string } {
	return link && "href" in link;
}
