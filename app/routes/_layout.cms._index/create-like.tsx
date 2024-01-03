import { Form } from "@remix-run/react";
import {
	Button,
	Heading,
	Input,
	Label,
	TextField,
} from "react-aria-components";

import { useT } from "~/helpers/use-i18n.hook";

import { INTENT } from "./types";

export function CreateLike() {
	let t = useT("cms._index.quickAction.like");

	return (
		<div className="flex flex-col gap-5">
			<Heading className="text-base font-semibold leading-6 text-gray-900">
				{t("title")}
			</Heading>

			<Form
				method="post"
				className="flex items-end gap-2 rounded-lg bg-white px-4 py-5 shadow sm:p-6"
				reloadDocument
			>
				<input type="hidden" name="intent" value={INTENT.createLike} />
				<TextField type="url" className="flex flex-grow flex-col gap-0.5">
					<Label className="text-sm font-medium text-gray-700">
						{t("label")}
					</Label>
					<Input
						name="url"
						className="w-full rounded-md border-2 border-blue-600 bg-white px-4 py-2 text-base"
					/>
				</TextField>

				<Button
					type="submit"
					className="block flex-shrink-0 rounded-md border-2 border-blue-600 bg-blue-100 px-4 py-2 text-center text-base font-medium text-blue-900"
				>
					{t("cta")}
				</Button>
			</Form>
		</div>
	);
}
