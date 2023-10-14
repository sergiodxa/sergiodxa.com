import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import avatar from "~/assets/avatar.png";

export function loader({ request }: LoaderFunctionArgs) {
	let url = new URL(avatar, request.url);
	return fetch(url);
}
