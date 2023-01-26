import type { TFunction } from "i18next";

import { useNavigation } from "@remix-run/react";
import { useId } from "react";

type Props = {
	t: TFunction;
	defaultValue?: string;
};

export function SearchForm({ t, defaultValue = "" }: Props) {
	let id = useId();
	let navigation = useNavigation();

	return (
		<form role="search" className="flex flex-col items-start gap-2">
			<label className="block text-sm font-medium text-gray-700" htmlFor={id}>
				{t("search.label")}
			</label>

			<input
				type="search"
				id={id}
				name="q"
				className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
				placeholder={t("search.placeholder") as string}
				defaultValue={defaultValue}
			/>

			<button
				type="submit"
				className="self-end rounded-full border border-gray-900 bg-gray-800 px-4 py-2 text-white"
			>
				{navigation.state === "idle"
					? t("search.button.default")
					: t("search.button.progress")}
			</button>
		</form>
	);
}
