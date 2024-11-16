import type { TFunction } from "i18next";

import { Form } from "@remix-run/react";
import { Button, Input, Label, SearchField } from "react-aria-components";

type Props = {
	t: TFunction;
	defaultValue?: string;
};

export function SearchForm({ t, defaultValue = "" }: Props) {
	return (
		<Form className="flex flex-col items-start gap-2">
			<SearchField name="q" className="contents" defaultValue={defaultValue}>
				<Label className="block text-sm font-medium text-gray-700">
					{t("search.label")}
				</Label>
				<Input
					type="search"
					name="q"
					className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
					placeholder={t("search.placeholder") as string}
				/>
			</SearchField>

			<Button
				type="submit"
				className="self-end rounded-full border border-gray-900 bg-gray-800 px-4 py-2 text-white"
			>
				{t("search.button.default")}
			</Button>
		</Form>
	);
}
