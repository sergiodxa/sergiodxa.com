import { useTranslation } from "react-i18next";
import { logout, requireUser } from "~/middleware/session";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import type { Route } from "./+types/route";

export async function loader(_: Route.LoaderArgs) {
	requireUser();
	return null;
}

export async function action(_: Route.ActionArgs) {
	return await logout();
}

export default function Component() {
	let { t } = useTranslation("translation", { keyPrefix: "logout" });
	return (
		<Form
			method="post"
			className="mx-auto flex max-w-screen-sm flex-col items-center gap-10 pt-10"
			reloadDocument
		>
			<header className="sm:mx-auto sm:w-full sm:max-w-lg">
				<h2 className="text-center text-3xl font-bold tracking-tight">
					{t("title")}
				</h2>
			</header>

			<Button type="submit" variant="destructive">
				{t("cta")}
			</Button>
		</Form>
	);
}
