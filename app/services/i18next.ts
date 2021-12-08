import i18next from "i18next";
import { initReactI18next } from "react-i18next";

export function init() {
  return i18next.use(initReactI18next).init({
    fallbackLng: "en",
    supportedLngs: ["en"],
    keySeparator: false,
    nsSeparator: false,
    defaultNS: "common",
    react: { useSuspense: false },
  });
}
