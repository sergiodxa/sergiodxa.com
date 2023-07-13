import type { KeyPrefix, Namespace } from "i18next";
import type { _DefaultNamespace } from "react-i18next/TransWithoutContext";

import { useTranslation } from "react-i18next";

export function useT<
	N extends Namespace = _DefaultNamespace,
	TKPrefix extends KeyPrefix<N> = undefined
>(ns?: string, keyPrefix?: TKPrefix) {
	return useTranslation(ns, { keyPrefix }).t;
}

export function useLocale() {
	return useTranslation().i18n.language;
}

export function useDirection() {
	return useTranslation().i18n.dir();
}
