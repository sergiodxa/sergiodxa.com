export class BetterStack {
	private BASE_URL = new URL("https://in.logs.betterstack.com/");

	private token: string;

	constructor(token: string) {
		this.token = token;
	}

	public async fetch(level: "info", message: string) {
		await fetch(this.BASE_URL, {
			method: "POST",
			body: JSON.stringify({ message, level }),
			headers: {
				Authorization: `Bearer ${this.token}`,
				"Content-Type": "application/json",
			},
		});
	}
}
