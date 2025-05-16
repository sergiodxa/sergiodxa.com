import { Heading } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { Button } from "~/ui/Button";
import { Form, type ValidationErrors } from "~/ui/Form";
import { TextField } from "~/ui/TextField";
import type { Route } from "../+types/route";
import { INTENT } from "../types";

interface CreateLikeProps {
	actionData: Route.ComponentProps["actionData"];
}

export function CreateLike({ actionData }: CreateLikeProps) {
	let { t } = useTranslation("translation", {
		keyPrefix: "cms._index.quickAction.like",
	});

	return (
		<div className="flex flex-col gap-5">
			<Heading className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-50">
				{t("title")}
			</Heading>

			<Form
				method="post"
				className="gap-2 rounded-lg bg-white px-4 py-5 shadow sm:p-6 dark:bg-zinc-600"
				reloadDocument
				errors={actionData?.status === 400 ? actionData.errors : undefined}
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
