import { env } from "cloudflare:workers";
import { Authenticator } from "remix-auth";
import { OAuth2Strategy } from "remix-auth-oauth2";

export type OAuth2Tokens = OAuth2Strategy.VerifyOptions["tokens"];

export function authenticate(request: Request) {
	let authenticator = new Authenticator<OAuth2Tokens>();
	let url = new URL(request.url);

	authenticator.use(
		new OAuth2Strategy(
			{
				clientId: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET,
				redirectURI: new URL("/auth/github/callback", url),
				authorizationEndpoint: new URL(
					"https://github.com/login/oauth/authorize",
				),
				tokenEndpoint: new URL("https://github.com/login/oauth/access_token"),
				scopes: ["read:user", "user:email"],
			},
			async ({ tokens }) => tokens,
		),
	);

	return authenticator.authenticate("oauth2", request);
}
