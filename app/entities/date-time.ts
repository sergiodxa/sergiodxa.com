import { z } from "zod";

export const DateTimeSchema = z
	.string()
	.datetime()
	.transform((value) => new Date(value))
	.pipe(z.date());
