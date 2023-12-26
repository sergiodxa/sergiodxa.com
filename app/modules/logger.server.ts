import type { AppLoadContext } from "@remix-run/cloudflare";

import { BetterStack } from "~/services/betterstack";

export class Logger {
	protected betterStack: BetterStack;

	constructor(context: AppLoadContext) {
		this.betterStack = new BetterStack(context.env.LOGTAIL_SOURCE_TOKEN);
	}

	async info(message: string) {
		if (process.env.NODE_ENV === "production") {
			await this.betterStack.fetch("info", message);
		} else console.info(message);
	}

	async http(request: Request): Promise<void> {
		if (process.env.NODE_ENV === "production") {
			await this.betterStack.fetch("info", `${request.method} ${request.url}`);
		} else console.info(`${request.method} ${request.url}`);
	}
}
