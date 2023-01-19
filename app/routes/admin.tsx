import type { LoaderArgs } from "@remix-run/cloudflare";

import { Link } from "@remix-run/react";
import { notFound } from "remix-utils";

import { useT } from "~/helpers/use-i18n.hook";
import { measure } from "~/utils/measure";

export async function loader({ request, context }: LoaderArgs) {
	return measure("routes/admin#loader", async () => {
		if (!(await context.services.auth.isAdmin(request))) {
			throw notFound("Not found");
		}

		await context.services.auth.authenticator.isAuthenticated(request, {
			failureRedirect: "/",
		});

		return null;
	});
}

export default function Component() {
	let t = useT("translation", "admin");
	return (
		<section>
			<h1>{t("title")}</h1>
			<ul>
				<li>
					<Link to="write">Write</Link>
				</li>
			</ul>
		</section>
	);
}
