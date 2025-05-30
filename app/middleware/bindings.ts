import { unstable_createContext } from "react-router";
import { z } from "zod";
import { getContext } from "./context-storage";

export const CloudflareContext = unstable_createContext<{
	env: Cloudflare.Env;
	ctx: ExecutionContext;
	cf?: RequestInitCfProperties;
}>();

export function getBindings() {
	let { env, ctx, cf } = getContext().get(CloudflareContext);

	return {
		cf,
		fs: { backups: env.BACKUPS },
		db: env.DB,
		kv: {
			cache: env.CACHE,
			auth: env.AUTH,
			redirects: env.REDIRECTS,
		},
		waitUntil: ctx.waitUntil.bind(ctx),
		env: z
			.object({
				COOKIE_SESSION_SECRET: z.string().min(1),
				GITHUB_CLIENT_ID: z.string().min(1),
				GITHUB_CLIENT_SECRET: z.string().min(1),
				GH_APP_ID: z.string().min(1),
				GH_APP_PEM: z.string().min(1),
			})
			.parse(env),
	};
}
