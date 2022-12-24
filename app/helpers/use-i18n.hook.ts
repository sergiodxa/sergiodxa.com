import type { KeyPrefix, Namespace } from "i18next";
import type { DefaultNamespace } from "react-i18next/TransWithoutContext";

import { useTranslation } from "react-i18next";

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
