import { describe, expect, test } from "vitest";
import { z } from "zod";

import { Schemas } from "./schemas";

describe("Schemas", () => {
	describe(Schemas.searchParams.name, () => {
		test("fails if parsed value is not a URLSearchParams", () => {
			expect(() => Schemas.searchParams().parse({})).toThrow();
		});

		test("parses a URLSearchParams", () => {
			expect(Schemas.searchParams().parse(new URLSearchParams())).toEqual({});
		});

		test("parses a URLSearchParams with a single value", () => {
			expect(
				Schemas.searchParams().parse(new URLSearchParams("foo=bar")),
			).toEqual({ foo: "bar" });
		});

		test("parses a URLSearchParams with multiple values", () => {
			expect(
				Schemas.searchParams().parse(new URLSearchParams("foo=bar&foo=baz")),
			).toEqual({ foo: ["bar", "baz"] });
		});

		test("parses a URLSearchParams with multiple values and a single value", () => {
			expect(
				Schemas.searchParams().parse(
					new URLSearchParams("foo=bar&foo=baz&bar=qux"),
				),
			).toEqual({ foo: ["bar", "baz"], bar: "qux" });
		});

		test("coerces a URLSearchParams with a single value to a number", () => {
			expect(
				Schemas.searchParams()
					.pipe(
						z.object({
							foo: z.coerce.number().nullable().default(1),
						}),
					)
					.parse(new URLSearchParams("foo=123")),
			).toEqual({ foo: 123 });
		});

		test("coerces a URLSearchParams with multiple values to a number", () => {
			expect(
				Schemas.searchParams()
					.pipe(
						z.object({
							foo: z.coerce.number().array(),
						}),
					)
					.parse(new URLSearchParams("foo=123&foo=456")),
			).toEqual({ foo: [123, 456] });
		});

		test("coerces a URLSearchParams with a single value to a boolean", () => {
			expect(
				Schemas.searchParams()
					.pipe(
						z.object({
							foo: z.coerce.boolean().nullable().default(true),
						}),
					)
					.parse(new URLSearchParams("foo=true")),
			).toEqual({ foo: true });
		});
	});

	describe(Schemas.formData.name, () => {
		test("fails if parsed value is not a FormData", () => {
			expect(() => Schemas.formData().parse({})).toThrow();
		});

		test("parses a FormData", () => {
			expect(Schemas.formData().parse(new FormData())).toEqual({});
		});

		test("parses a FormData with a single value", () => {
			let formData = new FormData();
			formData.set("foo", "bar");

			expect(Schemas.formData().parse(formData)).toEqual({
				foo: "bar",
			});
		});

		test("parses a FormData with multiple values", () => {
			let formData = new FormData();
			formData.append("foo", "bar");
			formData.append("foo", "baz");

			expect(Schemas.formData().parse(formData)).toEqual({
				foo: ["bar", "baz"],
			});
		});

		test("parses a FormData with multiple values and a single value", () => {
			let formData = new FormData();
			formData.append("foo", "bar");
			formData.append("foo", "baz");
			formData.set("bar", "qux");

			expect(Schemas.formData().parse(formData)).toEqual({
				foo: ["bar", "baz"],
				bar: "qux",
			});
		});

		test("coerces a FormData with a single value to a number", () => {
			let formData = new FormData();
			formData.set("foo", "123");

			expect(
				Schemas.formData()
					.pipe(
						z.object({
							foo: z.coerce.number().nullable().default(1),
						}),
					)
					.parse(formData),
			).toEqual({ foo: 123 });
		});

		test("coerces a FormData with multiple values to a number", () => {
			let formData = new FormData();
			formData.append("foo", "123");
			formData.append("foo", "456");

			expect(
				Schemas.formData()
					.pipe(
						z.object({
							foo: z.coerce.number().array(),
						}),
					)
					.parse(formData),
			).toEqual({ foo: [123, 456] });
		});

		test("coerces a FormData with a single value to a boolean", () => {
			let formData = new FormData();
			formData.set("foo", "true");

			expect(
				Schemas.formData()
					.pipe(
						z.object({
							foo: z.coerce.boolean().nullable().default(true),
						}),
					)
					.parse(formData),
			).toEqual({ foo: true });
		});
	});
});
