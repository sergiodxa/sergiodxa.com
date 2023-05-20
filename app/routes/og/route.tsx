/* eslint-disable react/no-unknown-property */
import type { DataFunctionArgs } from "@remix-run/cloudflare";
import type { TFunction } from "i18next";
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
import { NotFound } from "./cards/not-found";
import { Tutorial } from "./cards/tutorial";
import bold from "./fonts/bold.ttf";
import regular from "./fonts/regular.ttf";

declare module "react" {
	interface HTMLAttributes<T> {
		tw?: string;
	}
}

let wasm = initWasm(fetch("https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm"));

export async function loader({ request, context }: DataFunctionArgs) {
	await wasm;

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
			let svg = await render(
				url,
				<Card avatarURL={avatarURL} locale={locale} title={t("og.page.home")} />
			);

			let png = new Resvg(svg).render().asPng();

			return image(png, { type: "image/png" });
		}
	}

	if (type === "tutorial") {
		let { title } = await context.services.tutorials.read(slug);
		return await tutorial({ t, locale, baseURL: url, title });
	}

	return await notFound({ t, locale, baseURL: url, slug });
}

function svg(body: string, init: ResponseInit = {}) {
	return new Response(body, {
		...init,
		headers: {
			"content-type": "image/svg+xml",
			...init?.headers,
		},
	});
}

async function render(baseURL: URL, element: ReactNode) {
	return await satori(element, {
		width: 1200,
		height: 630,
		debug: process.env.NODE_ENV === "development",
		fonts: await getFonts(baseURL),
	});
}

type TutorialOptions = {
	t: TFunction;
	locale: string;
	baseURL: URL;
	title: string;
};

async function tutorial({ t, locale, baseURL, title }: TutorialOptions) {
	let avatarURL = new URL(avatar, baseURL);

	return svg(
		await satori(
			<Tutorial avatarURL={avatarURL} t={t} locale={locale} title={title} />,
			{
				width: 1200,
				height: 630,
				debug: process.env.NODE_ENV === "development",
				fonts: await getFonts(baseURL),
			}
		),
		{
			headers: {
				"cache-control": "no-cache, max-age=0",
			},
		}
	);
}

type NotFoundOptions = {
	t: TFunction;
	locale: string;
	baseURL: URL;
	slug: string;
};

async function notFound({ t, locale, baseURL, slug }: NotFoundOptions) {
	let avatarURL = new URL(avatar, baseURL);

	return svg(
		await satori(
			<NotFound avatarURL={avatarURL} slug={slug} t={t} locale={locale} />,
			{
				width: 1200,
				height: 630,
				debug: process.env.NODE_ENV === "development",
				fonts: await getFonts(baseURL),
			}
		),
		{
			status: 404,
			headers: {
				"cache-control": "no-cache, max-age=0",
			},
		}
	);
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
