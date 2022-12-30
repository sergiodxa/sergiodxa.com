import { describe, test } from "vitest";

import { json } from "~/utils/http";

describe(json.name, () => {
	test("should return a response with a status code", async () => {
		let response = await json({}, 201);
		await expect(response.json()).resolves.toEqual({});
		expect(response.status).toBe(201);
	});

	test("should resolve loader data", async () => {
		let response = await json({
			foo() {
				return "foo";
			},
			bar: "bar",
			async baz() {
				return "baz";
			},
			qux: Promise.resolve("qux"),
		});

		await expect(response.json()).resolves.toEqual({
			foo: "foo",
			bar: "bar",
			baz: "baz",
			qux: "qux",
		});
	});
});
