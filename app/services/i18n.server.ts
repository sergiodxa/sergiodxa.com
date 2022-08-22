import { createCookie } from "@remix-run/cloudflare";
import { RemixI18Next } from "remix-i18next";

import en from "~/locales/en";
import es from "~/locales/es";

export let cookie = createCookie("locale", {
	path: "/",
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
});

export let i18n = new RemixI18Next({
	detection: {
		fallbackLanguage: "en",
		supportedLanguages: ["es", "en"],
		cookie,
	},
	i18next: {
		supportedLngs: ["es", "en"],
		resources: { en: { translation: en }, es: { translation: es } },
	},
});
