import { z } from "zod";

const BASE_URL = new URL("https://api.convertkit.com/v3/");

const ResponseErrorSchema = z.object({
	error: z.string(),
	message: z.string(),
});

export class ConvertKit {
	protected key: string;
	protected secret: string;

	constructor(key: string, secret: string) {
		this.key = key;
		this.secret = secret;
	}

	async account() {
		let url = new URL("/v3/account", BASE_URL);
		let body = await this.fetch(url);

		return z
			.object({
				name: z.string(),
				plan_type: z.string(),
				primary_email_address: z.string(),
			})
			.parse(body);
	}

	async addSubscriberToForm(
		formId: string,
		payload: {
			email: string;
			first_name?: string;
			fields?: Record<string, string | number>;
			tags?: number[];
		},
	) {
		let url = new URL(`/v3/forms/${formId}/subscribe`, BASE_URL);
		let body = await this.fetch(url, {
			method: "POST",
			body: JSON.stringify(payload),
		});

		return z
			.object({
				subscription: z.object({
					id: z.number(),
					state: z.enum(["inactive", "active"]),
					created_at: z.string().datetime(),
					source: z.string(),
					referrer: z.null(),
					subscribable_id: z.number(),
					subscribable_type: z.literal("form"),
					subscriber: z.object({
						id: z.number(),
						first_name: z.string(),
						email_address: z.string().email(),
						state: z.enum(["inactive", "active"]),
						created_at: z.string().datetime(),
						fields: z.record(z.string()),
					}),
				}),
			})
			.parse(body);
	}

	protected async fetch(url: URL, options?: RequestInit) {
		url.searchParams.set("api_key", this.key);
		url.searchParams.set("api_secret", this.secret);

		let headers = new Headers(options?.headers);
		headers.set("content-type", "application/json; charset=utf-8");

		let response = await fetch(url.toString(), { ...options, headers });

		if (!response.ok) {
			let json = await response.json();
			let error = ResponseErrorSchema.parse(json);
			throw new Error(error.message);
		}

		let body: unknown = await response.json();
		return body;
	}
}
