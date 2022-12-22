import { z } from "zod";

export let envSchema = z.object({
	AIRTABLE_API_KEY: z.string().min(1),
	AIRTABLE_BASE: z.string().min(1),
	AIRTABLE_TABLE_ID: z.string().min(1),
	BASE_URL: z.string().min(1).url(),
	CN_EMAIL: z.string().min(1).email(),
	CN_SITE: z.string().min(1),
	CN_TOKEN: z.string().min(1),
	COOKIE_SESSION_SECRET: z.string().min(1),
	GITHUB_CLIENT_ID: z.string().min(1),
	GITHUB_CLIENT_SECRET: z.string().min(1),
	GITHUB_CALLBACK_URL: z.string().url(),
	GITHUB_CONTENT_REPO: z.string().min(1),
	GITHUB_TOKEN: z.string().min(1),
	GITHUB_USERNAME: z.string().min(1),
	LOGTAIL_SOURCE_TOKEN: z.string().min(1),
	NODE_ENV: z
		.union([
			z.literal("test"),
			z.literal("development"),
			z.literal("production"),
		])
		.default("development"),
});

export type Env = z.infer<typeof envSchema>;
