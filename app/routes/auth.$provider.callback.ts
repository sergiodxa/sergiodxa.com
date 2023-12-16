import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { z } from "zod";

import { Auth } from "~/modules/auth.server";
import { SessionStorage } from "~/modules/session.server";

export async function loader({ request, params, context }: LoaderFunctionArgs) {
	let provider = z.enum(["github"]).parse(params.provider);

	let auth = new Auth(context);

	let user = await auth.authenticate(provider, request);

	if (!user) throw redirect("/auth/login");

	let sessionStorage = new SessionStorage(context);

	let session = await sessionStorage.read(request.headers.get("cookie"));
	session.set("user", user);

	let headers = new Headers();

	headers.append("set-cookie", await sessionStorage.commit(session));
	headers.append("set-cookie", await auth.clear(request));

	throw redirect("/", { headers });
}
