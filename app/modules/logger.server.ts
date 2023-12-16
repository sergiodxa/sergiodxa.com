import type { AppLoadContext } from "@remix-run/cloudflare";

import { BetterStack } from "~/services/betterstack";

export class Logger {
	protected betterStack: BetterStack;

	constructor(context: AppLoadContext) {
		this.betterStack = new BetterStack(context.env.LOGTAIL_SOURCE_TOKEN);
	}

	async info(message: string) {
		await this.betterStack.fetch("info", message);
	}

	async http(request: Request): Promise<void> {
		await this.betterStack.fetch("info", `${request.method} ${request.url}`);
	}
}
