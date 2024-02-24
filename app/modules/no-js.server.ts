import { createCookie } from "@remix-run/cloudflare";

export class NoJS {
	#cookie = createCookie("no-js", {
		path: "/",
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	});

	async validate(request: Request) {
		let { searchParams } = new URL(request.url);
		let noJS = searchParams.has("no-js");

		if (noJS) return true;

		noJS = await this.#cookie.parse(request.headers.get("cookie"));

		if (noJS) return true;
		return false;
	}

	async save(noJS: boolean, headers = new Headers()) {
		headers.append("set-cookie", await this.#cookie.serialize(noJS));
		return headers;
	}
}
