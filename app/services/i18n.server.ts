import { resolve } from "node:path";

import { createCookie } from "@remix-run/node";
import Backend from "i18next-fs-backend";
import { RemixI18Next } from "remix-i18next";

export let cookie = createCookie("locale", {
	path: "/",
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
});

export let i18n = new RemixI18Next({
	backend: Backend,
	detection: {
		fallbackLanguage: "en",
		supportedLanguages: ["es", "en"],
		cookie,
	},
	i18next: {
		supportedLngs: ["es", "en"],
		backend: { loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json") },
	},
});
