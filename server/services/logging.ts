export interface ILoggingService {
	info(message: string): Promise<void>;

	http(request: Request): Promise<void>;
}

export class LoggingService implements ILoggingService {
	constructor(private sourceKey: string) {}

	async info(message: string) {
		await this.log("info", message);
	}

	async http(request: Request): Promise<void> {
		await this.log("info", `${request.method} ${request.url}`);
	}

	private async log(level: "info", message: string) {
		if (process.env.NODE_ENV === "development") {
			return console.info(message);
		}
		await fetch("https://in.logtail.com/", {
			method: "POST",
			body: JSON.stringify({ message, level }),
			headers: {
				Authorization: `Bearer ${this.sourceKey}`,
				"Content-Type": "application/json",
			},
		});
	}
}
