import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";
import { useActionData } from "@remix-run/react";
import { z } from "zod";

import { SessionStorage } from "~/modules/session.server";
import { GitHub } from "~/services/github.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { Schemas } from "~/utils/schemas";
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

		try {
			let { url } = Schemas.formData()
				.pipe(
					z.object({
						url: z
							.string()
							.url()
							.transform((value) => new URL(value)),
					}),
				)
				.parse(formData);

			await createQuickLike(context, url, user.id);
			throw redirect("/cms");
		} catch (error) {
			if (error instanceof Response) throw error;
			if (error instanceof z.ZodError) {
				return json(
					{
						intent: INTENT.createLike,
						errors: error.issues.reduce(
							(errors, issue) => {
								errors[issue.path[0]!] = issue.message;
								return errors;
							},
							{} as Record<string, string>,
						),
					},
					{ status: 400 },
				);
			}

			if (error instanceof Error) {
				return json(
					{ intent: INTENT.createLike, errors: { url: error.message } },
					{ status: 400 },
				);
			}

			throw error;
		}
	}

	if (formData.get("intent") === INTENT.dump) {
		try {
			let dump = await context.db.dump();
			await context.fs.backups.put(`${new Date().toISOString()}.sql`, dump);
			return json({ intent: INTENT.dump, success: true });
		} catch (error) {
			console.log(error);
			return json(
				{ intent: INTENT.dump, errors: { intent: "Failed to dump database" } },
				{ status: 400 },
			);
		}
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
				<DumpDatabase />
			</div>
		</div>
	);
}

function DumpDatabase() {
	let actionData = useActionData<typeof action>();

	let errors =
		actionData?.intent === "DUMP_DB" && "errors" in actionData
			? actionData.errors
			: {};

	return (
		<Form method="post" errors={errors}>
			<Button type="submit" name="intent" value={INTENT.dump}>
				Dump copy of the database
			</Button>
		</Form>
	);
}
