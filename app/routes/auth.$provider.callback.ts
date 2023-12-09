import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { z } from "zod";

import { Auth } from "~/modules/auth.server";
import { SessionStorage } from "~/modules/session.server";
import { GitHub } from "~/services/github.server";

export async function loader(_: LoaderFunctionArgs) {
	let provider = z.enum(["github"]).parse(_.params.provider);

	let gh = new GitHub(_.context.env.GH_APP_ID, _.context.env.GH_APP_PEM);

	let auth = new Auth(
		{ gh },
		_.context.env.GITHUB_CLIENT_ID,
		_.context.env.GITHUB_CLIENT_SECRET,
	);

	let user = await auth.authenticate(provider, _.request);

	if (!user) throw redirect("/auth/login");

	let sessionStorage = new SessionStorage(
		{ kv: _.context.kv.auth },
		_.context.env.COOKIE_SESSION_SECRET,
	);

	let session = await sessionStorage.read(_.request.headers.get("cookie"));
	session.set("user", user);

	let headers = new Headers();

	headers.append("set-cookie", await sessionStorage.commit(session));
	headers.append("set-cookie", await auth.clear(_.request));

	throw redirect("/", { headers });
}
