import { Backend, RemixI18Next } from "remix-i18next";

class InMemoryBackend implements Backend {
  constructor(
    private readonly data: {
      [locale: string]: {
        [namespace: string]: {
          [key: string]: string;
        };
      };
    }
  ) {}

  async getTranslations(namespace: string, locale: string) {
    return this.data[locale][namespace];
  }
}

export let i18n = new RemixI18Next(
  new InMemoryBackend({ en: { common: {} } }),
  { fallbackLng: "en", supportedLanguages: ["en"] }
);
