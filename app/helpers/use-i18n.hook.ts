import {
  useTranslation,
  type DefaultNamespace,
  type KeyPrefix,
  type Namespace,
} from "react-i18next";

export function useT<
  N extends Namespace = DefaultNamespace,
  TKPrefix extends KeyPrefix<N> = undefined
>(ns?: N | Readonly<N>, keyPrefix?: TKPrefix) {
  return useTranslation(ns, { keyPrefix }).t;
}

export function useLocale() {
  return useTranslation().i18n.language;
}

export function useDirection() {
  return useTranslation().i18n.dir();
}
