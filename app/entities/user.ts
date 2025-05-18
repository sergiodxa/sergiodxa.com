import { z } from "zod";

export const UserSchema = z.object({
	id: z.string().uuid(),
	role: z.enum(["guest", "admin"]),
	email: z.string().email().max(320),
	username: z.string().min(1).max(39),
	displayName: z.string().min(1).max(255),
	avatar: z.string().url().max(2048),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type User = z.output<typeof UserSchema>;
