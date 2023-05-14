import type { DataFunctionArgs } from "@remix-run/cloudflare";

import octicons from "@primer/octicons";

export async function loader({ request }: DataFunctionArgs) {
	let url = new URL(request.url);

	let iconNames = url.searchParams.getAll("name");

	let icons: { name: string; svg: string }[] = [];

	for (let name of iconNames) {
		let icon = octicons[name as keyof typeof octicons];
		if (icon) icons.push({ name, svg: icon.toSVG() });
	}

	let symbols = icons
		.map(({ name, svg }) => {
			return svg
				.replace(/^<svg/, '<symbol id="' + name + '"')
				.replace(/svg>$/, "symbol>");
		})
		.join("\n");

	let body = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>${symbols}</defs></svg>`;

	return new Response(body, {
		headers: {
			"Content-Type": "image/svg+xml",
			"Cache-Control": "public, s-maxage=31536000, max-age=60, immutable",
		},
	});
}
