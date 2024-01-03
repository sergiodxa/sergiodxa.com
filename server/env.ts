import { z } from "zod";

export let EnvSchema = z.object({
	AIRTABLE_API_KEY: z.string().min(1),
	AIRTABLE_BASE: z.string().min(1),
	AIRTABLE_TABLE_ID: z.string().min(1),
	BASE_URL: z.string().min(1).url(),
	CF_PAGES: z
		.literal("1")
		.optional()
		.transform(Boolean)
		.transform((isCFPages) => {
			if (isCFPages) return "production";
			return "development";
		}),
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
	DSN: z.string().url().optional(),
	WRITE_PASSWORD: z.string(),

	GH_APP_ID: z.string().min(1),
	GH_APP_PEM: z.string().min(1),

	CK_API_KEY: z.string(),
	CK_API_SECRET: z.string(),
	CK_FORM_ID: z.string(),
});

export type Env = z.infer<typeof EnvSchema>;
