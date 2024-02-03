import { useT } from "~/helpers/use-i18n.hook";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";

import { INTENT } from "./types";

export function ResetTutorials() {
	let t = useT("cms.tutorials.reset");

	return (
		<Form method="post">
			<input type="hidden" name="intent" value={INTENT.reset} />
			<Button type="submit" variant="secondary">
				{t("cta")}
			</Button>
		</Form>
	);
}
