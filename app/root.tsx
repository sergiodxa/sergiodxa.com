import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import type { ReactNode } from "react";

import { json } from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useCatch,
	useLoaderData,
} from "@remix-run/react";
import nProgressUrl from "nprogress/nprogress.css";
import { useChangeLanguage } from "remix-i18next";
import { useShouldHydrate } from "remix-utils";

import { useDirection, useLocale } from "~/helpers/use-i18n.hook";
import { i18n } from "~/services/i18n.server";
import tailwindUrl from "~/styles/tailwind.css";

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
	return (
		<Document locale={useLocale()} title="Error!">
			Unexpected error
		</Document>
	);
}

export function CatchBoundary() {
	let caught = useCatch();
	return (
		<Document locale={useLocale()} title={caught.statusText}>
			{caught.statusText}
		</Document>
	);
}

function Document({
	children,
	title,
	locale,
}: {
	children: ReactNode;
	title?: string;
	locale: string;
}) {
	let shouldHydrate = useShouldHydrate();
	let dir = useDirection();
	return (
		<html lang={locale} dir={dir} className="h-full">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				{title ? <title>{title}</title> : null}
				<Meta />
				<Links />
			</head>
			<body className="h-full">
				{children}
				<ScrollRestoration />
				{shouldHydrate && <Scripts />}
				<LiveReload />
			</body>
		</html>
	);
}
