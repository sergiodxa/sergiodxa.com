import type { unstable_MiddlewareFunction } from "react-router";
import { redirect } from "react-router";

function createNoWWWMiddleware(): unstable_MiddlewareFunction<Response> {
	return async function noWWWMiddleware({ request }, next) {
		let url = new URL(request.url);

		if (url.hostname.startsWith("www.")) {
			url.hostname = url.hostname.slice(4);
			throw redirect(url.href, 302);
		}

		return await next();
	};
}

export const noWWWMiddleware = createNoWWWMiddleware();
