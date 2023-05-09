import type { AppLoadContext } from "@remix-run/cloudflare";

import { describe, expect } from "vitest";

import { loader } from "./route";

describe(loader.name, () => {
	test("returns feed data", async () => {
		let response = await loader({
			request: new Request("https://sergiodxa.com/"),
			params: {},
			context: {
				time<Type>(_: string, fn: () => Type) {
					return fn();
				},
				services: {
					log: {
						http() {},
					},
					feed: {
						async perform() {
							return {
								notes: [],
								bookmarks: [],
								tutorials: [],
							};
						},
					},
				},
			} as unknown as AppLoadContext,
		});

		await expect(response.json()).resolves.toEqual({
			notes: [],
			bookmarks: [],
			tutorials: [],
		});
	});
});
