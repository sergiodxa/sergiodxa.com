import { redirectDocument } from "@remix-run/cloudflare";

export function loader() {
	return redirectDocument("https://github.com/sponsors/sergiodxa");
}
