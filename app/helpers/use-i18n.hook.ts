import { useTranslation } from "react-i18next";

export function useI18n() {
  return useTranslation().i18n;
}

export function useT() {
  return useTranslation().t;
}

export function useLocale() {
  return useI18n().language;
}

export function useDirection() {
  return useI18n().dir();
}
