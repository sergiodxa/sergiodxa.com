import { useNavigation } from "react-router";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import type { Route } from "../+types/route";
import { INTENT } from "../types";

interface DumpDatabaseProps {
	actionData: Route.ComponentProps["actionData"];
}

export function DumpDatabase({ actionData }: DumpDatabaseProps) {
	let navigation = useNavigation();

	let errors =
		actionData?.intent === INTENT.dump && "errors" in actionData
			? actionData.errors
			: undefined;

	let success = actionData?.intent === INTENT.dump && "success" in actionData;

	let isPending = navigation.formData?.get("intent") === INTENT.dump;

	return (
		<Form method="post" errors={errors}>
			{errors && (
				<p className="text-sm text-red-600 forced-colors:text-[Mark]">
					{errors?.intent}
				</p>
			)}
			{success && (
				<p className="text-sm text-green-600 forced-colors:text-[Mark]">
					Database dumped successfully
				</p>
			)}
			<Button type="submit" name="intent" value={INTENT.dump}>
				Dump copy of the database
			</Button>
			{isPending && (
				<p className="text-sm text-gray-600">Dumping database...</p>
			)}
		</Form>
	);
}
