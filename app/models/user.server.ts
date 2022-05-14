import { z } from "zod";

export type User = z.infer<typeof userModel>;

export let userModel = z.object({
  id: z.string().cuid(),
  role: z.union([z.literal("reader"), z.literal("author"), z.literal("admin")]),
  locale: z.string().default("en"),
  email: z.string().email(),
  displayName: z.string().nullable(),
  avatar: z.string().nullable(),
  disabledAt: z.date().nullable(),
  updatedAt: z.date(),
  createdAt: z.date().default(() => new Date()),
});
