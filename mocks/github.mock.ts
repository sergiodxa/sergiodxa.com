import fs from "node:fs/promises";
import { resolve } from "node:path";

import { rest } from "msw";
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
	rest.get(
		"https://raw.githubusercontent.com/:owner/:repo/main/:path*",
		async (req, res, ctx) => {
			let { path } = z.object({ path: z.string().array() }).parse(req.params);

			if (!(await existsFile(path.join("/")))) {
				return res(
					ctx.status(404),
					ctx.json({
						message: "Not Found",
					})
				);
			}

			let content = await fs.readFile(resolve(path.join("/")), "utf-8");

			return res(ctx.status(200), ctx.text(content));
		}
	),
];
