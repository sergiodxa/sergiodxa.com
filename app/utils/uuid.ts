import type { Tagged } from "type-fest";
import { z } from "zod";

export type UUID = Tagged<string, "__uuid">;

export function generateUUID() {
	return crypto.randomUUID() as UUID;
}

export function assertUUID(value: unknown): asserts value is UUID {
	if (!z.string().uuid().safeParse(value).success) {
		throw new TypeError("Invalid UUID");
	}
}
