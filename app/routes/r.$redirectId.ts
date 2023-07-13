import type { LoaderArgs } from "@remix-run/cloudflare";

import { redirect } from "@remix-run/cloudflare";
import invariant from "tiny-invariant";

const REDIRECTS = {
	"remix-next": "https://sergiodxa.com/articles/remix-vs-next-js-comparison",
	"remix-auth-return-to":
		"https://sergiodxa.com/articles/add-returnto-behavior-to-remix-auth",
	"cache-http-server":
		"https://sergiodxa.com/articles/http-vs-server-side-cache-in-remix",
	"cache-loader-route":
		"https://sergiodxa.com/articles/loader-vs-route-cache-headers-in-remix",
};

export async function loader({ params }: LoaderArgs) {
	try {
		let { redirectId } = params;

		invariant(redirectId, "The redirectId is required");
		invariant(
			Object.keys(REDIRECTS).includes(redirectId),
			`The redirectId "${redirectId}" is not valid`,
		);

		return redirect(REDIRECTS[redirectId as keyof typeof REDIRECTS]);
	} catch (error) {
		return redirect("/");
	}
}
