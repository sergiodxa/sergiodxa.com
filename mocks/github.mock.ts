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
		"https://api.github.com/repos/:owner/:repo/contents/:path",
		async (req, res, ctx) => {
			let { path } = z.object({ path: z.string() }).parse(req.params);

			if (!(await existsFile(path))) {
				return res(
					ctx.status(404),
					ctx.json({
						message: "Not Found",
					})
				);
			}

			let content = await fs.readFile(resolve(path), "utf-8");

			return res(
				ctx.status(200),
				ctx.json({
					type: "file",
					content: Buffer.from(content).toString("base64"),
				})
			);
		}
	),
];
