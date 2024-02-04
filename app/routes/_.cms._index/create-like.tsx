import type { action } from "./route";

import { useActionData } from "@remix-run/react";
import { Heading } from "react-aria-components";

import { useT } from "~/helpers/use-i18n.hook";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { TextField } from "~/ui/TextField";

import { INTENT } from "./types";

export function CreateLike() {
	let t = useT("cms._index.quickAction.like");

	let actionData = useActionData<typeof action>();

	if (actionData?.intent !== INTENT.createLike) actionData = undefined;

	return (
		<div className="flex flex-col gap-5">
			<Heading className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-50">
				{t("title")}
			</Heading>

			<Form
				method="post"
				className="gap-2 rounded-lg bg-white px-4 py-5 shadow sm:p-6 dark:bg-zinc-600"
				reloadDocument
				errors={actionData?.errors}
			>
				<input type="hidden" name="intent" value={INTENT.createLike} />

				<TextField type="url" name="url" label={t("label")} isRequired />

				<Button type="submit" variant="primary">
					{t("cta")}
				</Button>
			</Form>
		</div>
	);
}
