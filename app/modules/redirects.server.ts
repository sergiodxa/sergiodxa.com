import type { AppLoadContext } from "@remix-run/cloudflare";

import { z } from "zod";

export class Redirects {
	constructor(protected loadContext: AppLoadContext) {}

	async list() {
		let { keys } = await this.loadContext.kv.redirects.list();
		return RedirectSchema.array().parse(keys.map((key) => key.metadata));
	}

	async add(name: string, from: string, to: string) {
		await this.loadContext.kv.redirects.put(
			name,
			JSON.stringify({ from, to }),
			{ metadata: { from, to } },
		);
	}

	async show(name: string) {
		let redirect = await this.loadContext.kv.redirects.get(name, "json");
		if (!redirect) return null;
		return RedirectSchema.parse(redirect);
	}
}

const RedirectSchema = z.object({ from: z.string(), to: z.string() });
