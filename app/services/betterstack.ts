export class BetterStack {
	private BASE_URL = new URL("https://in.logs.betterstack.com/");

	constructor(private token: string) {}

	public async fetch(level: "info", message: string) {
		try {
			await fetch(this.BASE_URL, {
				method: "POST",
				body: JSON.stringify({ message, level }),
				headers: {
					Authorization: `Bearer ${this.token}`,
					"Content-Type": "application/json",
				},
			});
		} catch {}
	}
}
