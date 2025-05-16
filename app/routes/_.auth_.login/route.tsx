import { useTranslation } from "react-i18next";
import { href, redirect } from "react-router";
import { ok } from "~/helpers/response";
import { getUser } from "~/middleware/session";
import { authenticate } from "~/modules/auth.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import type { Route } from "./+types/route";

export async function loader(_: Route.LoaderArgs) {
	let user = getUser();
	if (user) throw redirect(href("/"));
	return ok(null);
}

export async function action({ request }: Route.ActionArgs) {
	return await authenticate(request);
}

export default function Component() {
	let { t } = useTranslation("translation", { keyPrefix: "login" });

	return (
		<Form
			method="post"
			className="mx-auto flex max-w-screen-sm flex-col items-center gap-10 pt-10"
			reloadDocument
		>
			<header className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="text-center text-3xl font-bold tracking-tight">
					{t("title")}
				</h2>
			</header>

			<Button type="submit" variant="primary">
				{t("github")}
			</Button>
		</Form>
	);
}
