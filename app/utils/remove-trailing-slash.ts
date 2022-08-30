import { redirect } from "@remix-run/cloudflare";

export function removeTrailingSlash(url: URL) {
	if (url.pathname.endsWith("/") && url.pathname !== "/") {
		throw redirect(url.toString().slice(0, url.toString().length - 1));
	}
}
