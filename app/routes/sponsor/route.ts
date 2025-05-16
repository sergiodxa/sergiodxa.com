import { redirectDocument } from "react-router";

export function loader() {
	return redirectDocument("https://github.com/sponsors/sergiodxa");
}
