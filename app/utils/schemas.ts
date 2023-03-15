import { z } from "zod";

export function formData() {
	return z.instanceof(FormData).transform((formData) => {
		return z
			.array(
				z.tuple([z.string(), z.string().or(z.instanceof(File)).nullable()])
			)
			.transform((entries) => Object.fromEntries(entries))
			.parse(Object.entries(formData));
	});
}
