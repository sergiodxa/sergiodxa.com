import { href, redirectDocument } from "react-router";

export function loader() {
	return redirectDocument(href("/rss"));
}
