import fs from "node:fs/promises";
import { resolve } from "node:path";

import { http, HttpResponse } from "msw";
import { z } from "zod";

async function existsFile(path: string) {
	try {
		await fs.access(resolve(path));
		return true;
	} catch (error) {
		return false;
	}
}

export let github = [
	http.get(
		"https://raw.githubusercontent.com/:owner/:repo/main/:path*",
		async (request) => {
			let { path } = z
				.object({ path: z.string().array() })
				.parse(request.params);

			if (!(await existsFile(path.join("/")))) {
				return HttpResponse.json({ message: "Not Found" }, { status: 404 });
			}

			let content = await fs.readFile(resolve(path.join("/")), "utf-8");

			return HttpResponse.json(JSON.parse(content), { status: 200 });
		},
	),
];
