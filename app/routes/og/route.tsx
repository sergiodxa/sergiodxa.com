/* eslint-disable react/no-unknown-property */
import type { DataFunctionArgs } from "@remix-run/cloudflare";
import type { ReactNode } from "react";
import type { SatoriOptions } from "satori";

import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { image } from "remix-utils";
import satori from "satori";
import { z } from "zod";

import avatar from "~/assets/avatar.png";
import { i18n } from "~/i18n.server";
import { Schemas } from "~/utils/schemas";

import { Card } from "./cards";
import bold from "./fonts/bold.ttf";
import regular from "./fonts/regular.ttf";

let wasmInitialized = false;

export async function loader({ request, context }: DataFunctionArgs) {
	if (!wasmInitialized) {
		await initWasm(fetch("https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm"));
		wasmInitialized = true;
	}

	let locale = await i18n.getLocale(request);
	let t = await i18n.getFixedT(locale);

	let url = new URL(request.url);
	let { slug, type } = Schemas.searchParams()
		.pipe(
			z.object({
				slug: z.string(),
				type: z.enum(["tutorial", "article", "page"]),
			})
		)
		.parse(url.searchParams);

	let avatarURL = new URL(avatar, url);

	if (type === "page") {
		if (slug === "/") {
			let png = await render(
				url,
				<Card avatarURL={avatarURL} locale={locale} title={t("og.page.home")} />
			);
			return image(png, { type: "image/png" });
		}
	}

	if (type === "tutorial") {
		let { title } = await context.services.tutorials.read(slug);

		let png = await render(
			url,
			<Card avatarURL={avatarURL} locale={locale} title={title} />
		);

		return image(png, { type: "image/png" });
	}

	let png = await render(
		url,
		<Card
			avatarURL={avatarURL}
			locale={locale}
			title={t("og.notFound.title")}
		/>
	);

	return image(png, { type: "image/png" });
}

async function render(baseURL: URL, element: ReactNode) {
	let svg = await satori(element, {
		width: 1200,
		height: 630,
		debug: process.env.NODE_ENV === "development",
		fonts: await getFonts(baseURL),
	});
	return new Resvg(svg).render().asPng();
}

async function getFonts(baseURL: URL): Promise<SatoriOptions["fonts"]> {
	return [
		{
			name: "Inter",
			data: await fetchFont(regular, baseURL),
			weight: 400,
			style: "normal",
		},
		{
			name: "Inter",
			data: await fetchFont(bold, baseURL),
			weight: 700,
			style: "normal",
		},
	];
}

async function fetchFont(font: string, baseURL: URL) {
	let url = new URL(font, baseURL);
	let response = await fetch(url);
	return await response.arrayBuffer();
}
