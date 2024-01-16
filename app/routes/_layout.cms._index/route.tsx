import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";
import { z } from "zod";

import { SessionStorage } from "~/modules/session.server";
import { GitHub } from "~/services/github.server";
import { assertUUID } from "~/utils/uuid";

import { CreateLike } from "./create-like";
import { LastDaySearch } from "./last-day-search";
import { createQuickLike, queryLastDaySearch, queryStats } from "./queries";
import { Stats } from "./stats";
import { INTENT } from "./types";

export async function loader({ request, context }: LoaderFunctionArgs) {
	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	let [stats, lastDaySearch] = await Promise.all([
		queryStats(context),
		queryLastDaySearch(context),
	]);

	let gh = new GitHub(context.env.GH_APP_ID, context.env.GH_APP_PEM);
	let result = await gh.sponsors();
	let sponsors = result.node.sponsorshipsAsMaintainer.nodes.map(
		(n) => n.sponsorEntity,
	);

	return json({ stats, lastDaySearch, sponsors });
}

export async function action({ request, context }: ActionFunctionArgs) {
	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	let formData = await request.formData();

	if (formData.get("intent") === INTENT.createLike) {
		assertUUID(user.id);

		let url = z
			.string()
			.url()
			.transform((value) => new URL(value))
			.parse(formData.get("url"));

		await createQuickLike(context, url, user.id);
		throw redirect("/cms");
	}

	throw redirect("/cms");
}

export default function Component() {
	return (
		<div className="flex flex-col gap-8">
			<Stats />
			<div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
				<CreateLike />
				<div className="col-span-2">
					<LastDaySearch />
				</div>
			</div>
		</div>
	);
}
