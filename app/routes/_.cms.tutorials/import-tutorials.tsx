import { useT } from "~/helpers/use-i18n.hook";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";

import { INTENT } from "./types";

export function ImportTutorials() {
	let t = useT("cms.tutorials.import");

	return (
		<Form method="post">
			<input type="hidden" name="intent" value={INTENT.import} />
			<Button type="submit" variant="secondary">
				{t("cta")}
			</Button>
		</Form>
	);
}
