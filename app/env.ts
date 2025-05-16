import { z } from "zod";

const EnvSchema = z.object({
	BASE_URL: z.string().min(1).url(),

	COOKIE_SESSION_SECRET: z.string().min(1),

	GITHUB_CLIENT_ID: z.string().min(1),
	GITHUB_CLIENT_SECRET: z.string().min(1),
	GITHUB_CALLBACK_URL: z.string().url(),
	GITHUB_CONTENT_REPO: z.string().min(1),
	GITHUB_TOKEN: z.string().min(1),
	GITHUB_USERNAME: z.string().min(1),

	GH_APP_ID: z.string().min(1),
	GH_APP_PEM: z.string().min(1),
});

export type Env = z.infer<typeof EnvSchema>;
