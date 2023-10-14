import { z } from "zod";

import { isEmpty } from "./arrays";

export namespace Schemas {
	// eslint-disable-next-line prefer-let/prefer-let
	export const FormDataEntryValueSchema = z
		.union([z.string(), z.instanceof(File)])
		.nullable();

	export function formData() {
		return z.instanceof(FormData).transform((formData) => {
			let entries: Array<[string, FormDataEntryValue | FormDataEntryValue[]]> =
				[];

			for (let key of formData.keys()) {
				let value = formData.getAll(key);
				if (isEmpty(value)) continue;
				if (value.length === 1) entries.push([key, value[0]]);
				else entries.push([key, value]);
			}

			return z
				.array(
					z.tuple([
						z.string(),
						FormDataEntryValueSchema.or(FormDataEntryValueSchema.array()),
					]),
				)
				.transform((entries) => Object.fromEntries(entries))
				.parse(entries);
		});
	}

	export function searchParams() {
		return z.instanceof(URLSearchParams).transform((searchParams) => {
			let entries: Array<[string, string | string[]]> = [];

			for (let key of searchParams.keys()) {
				let value = searchParams.getAll(key);
				if (isEmpty(value)) continue;
				if (value.length === 1) entries.push([key, value[0]]);
				else entries.push([key, value]);
			}

			return z
				.array(z.tuple([z.string(), z.string().or(z.string().array())]))
				.transform((entries) => Object.fromEntries(entries))
				.parse(entries);
		});
	}
}
