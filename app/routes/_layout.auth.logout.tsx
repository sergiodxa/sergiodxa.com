import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { useT } from "~/helpers/use-i18n.hook";
import { SessionStorage } from "~/modules/session.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";

export async function loader({ request, context }: LoaderFunctionArgs) {
	await SessionStorage.requireUser(context, request);
	return json(null);
}

export async function action({ request, context }: ActionFunctionArgs) {
	return await SessionStorage.logout(context, request);
}

export default function Component() {
	let t = useT();
	return (
		<Form
			method="post"
			className="mx-auto flex max-w-screen-sm flex-col items-center gap-10 pt-10"
			reloadDocument
		>
			<header className="sm:mx-auto sm:w-full sm:max-w-lg">
				<h2 className="text-center text-3xl font-bold tracking-tight">
					{t("logout.title")}
				</h2>
			</header>

			<Button type="submit" variant="destructive">
				{t("logout.cta")}
			</Button>
		</Form>
	);
}
