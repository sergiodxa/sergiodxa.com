export interface ILoggingService {
	info(message: string): Promise<void>;
}

export class LoggingService implements ILoggingService {
	constructor(private sourceKey: string) {}

	async info(message: string) {
		await this.log("info", message);
	}

	private async log(level: "info", message: string) {
		await fetch("https://in.logtail.com/", {
			body: JSON.stringify({ message, level }),
			headers: {
				Authorization: `Bearer ${this.sourceKey}`,
				"Content-Type": "application/json",
			},
		});
	}
}
