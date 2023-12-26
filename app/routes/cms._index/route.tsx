import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";

import { SessionStorage } from "~/modules/session.server";

import { queryStats } from "./queries";
import { Stats } from "./stats";

export async function loader({ request, context }: LoaderFunctionArgs) {
	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	let stats = await queryStats(context);

	return json({ stats });
}

export default function Component() {
	return <Stats />;
}
