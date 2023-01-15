import type { i18n } from "i18next";

import { RemixBrowser } from "@remix-run/react";
import { createInstance } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { getInitialNamespaces } from "remix-i18next";

import en from "~/locales/en";
import es from "~/locales/es";
import { measure } from "~/utils/measure";

measure("entry.client#hydrate", async () => {
	let instance = createInstance().use(initReactI18next).use(LanguageDetector);
	await instance.init({
		supportedLngs: ["es", "en"],
		fallbackLng: "en",
		react: { useSuspense: false },
		ns: getInitialNamespaces(),
		detection: { order: ["htmlTag"], caches: [] },
		resources: { en: { translation: en }, es: { translation: es } },
		interpolation: { escapeValue: false },
	});

	return hydrate(instance);
});

function hydrate(instance: i18n) {
	startTransition(() => {
		hydrateRoot(
			document,
			<I18nextProvider i18n={instance}>
				<StrictMode>
					<RemixBrowser />
				</StrictMode>
			</I18nextProvider>
		);
	});
}
