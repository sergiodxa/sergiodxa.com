import { useSubmit } from "@remix-run/react";
import { Button, Form } from "react-aria-components";

import { useT } from "~/helpers/use-i18n.hook";

import { INTENT } from "./types";

export function ImportBookmarks() {
	let submit = useSubmit();
	let t = useT("cms.likes.import");

	return (
		<Form
			method="post"
			onSubmit={(event) => {
				event.preventDefault();
				submit(event.currentTarget);
			}}
		>
			<input type="hidden" name="intent" value={INTENT.import} />
			<Button
				type="submit"
				className="block flex-shrink-0 rounded-md border-2 border-blue-600 bg-blue-100 px-4 py-2 text-center text-base font-medium text-blue-900"
			>
				{t("cta")}
			</Button>
		</Form>
	);
}
