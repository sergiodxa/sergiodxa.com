import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { z } from "zod";

import { Auth } from "~/modules/auth.server";
import { SessionStorage } from "~/modules/session.server";

export async function loader({ request, params, context }: LoaderFunctionArgs) {
	try {
		let provider = z.enum(["github"]).parse(params.provider);

		let auth = new Auth(new URL(request.url), context);

		let user = await auth.authenticate(provider, request);

		if (!user) throw redirect("/auth/login");

		let sessionStorage = new SessionStorage(context);

		let session = await sessionStorage.read(request.headers.get("cookie"));
		session.set("user", user);

		let headers = new Headers();

		headers.append("set-cookie", await sessionStorage.commit(session));
		headers.append("set-cookie", await auth.clear(request));

		throw redirect("/", { headers });
	} catch (error) {
		console.error(error);
		throw error;
	}
}
