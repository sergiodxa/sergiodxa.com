import { z } from "zod";

export type UUID = string & { __uuid: true };

export function generateUUID() {
	return crypto.randomUUID() as UUID;
}

export function assertUUID(value: unknown): asserts value is UUID {
	if (!z.string().uuid().safeParse(value).success) {
		throw new TypeError("Invalid UUID");
	}
}
