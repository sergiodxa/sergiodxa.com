import { stylesheet } from "remix-utils/responses";

import sansFont from "~/fonts/sans.woff2";

export function loader() {
	let headers = new Headers();
	headers.append("ETag", `W/"${sansFont}"`);
	headers.append("Cache-Control", "public, max-age=31536000, immutable");

	return stylesheet(
		`@font-face {
	font-family: "Mona Sans";
	font-display: swap;
	font-weight: 100 900;
	src:
		local("Mona Sans"),
		url(${sansFont}) format("woff2");
}`,
		{ headers },
	);
}
