import { BetterStack } from "~/services/betterstack";

export class Logger {
	protected betterStack: BetterStack;

	constructor(token: string) {
		this.betterStack = new BetterStack(token);
	}

	async info(message: string) {
		await this.betterStack.fetch("info", message);
	}

	async http(request: Request): Promise<void> {
		await this.betterStack.fetch("info", `${request.method} ${request.url}`);
	}
}
