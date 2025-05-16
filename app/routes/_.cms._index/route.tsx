import { href, redirect } from "react-router";
import { z } from "zod";
import { badRequest, ok } from "~/helpers/response";
import { getBindings } from "~/middleware/bindings";
import { requireUser } from "~/middleware/session";
import { GitHub } from "~/modules/github.server";
import { Schemas } from "~/utils/schemas";
import { assertUUID } from "~/utils/uuid";
import type { Route } from "./+types/route";
import { CreateLike } from "./components/create-like";
import { DumpDatabase } from "./components/dump-database";
import { LastDaySearch } from "./components/last-day-search";
import { Stats } from "./components/stats";
import { createQuickLike, queryLastDaySearch, queryStats } from "./queries";
import { INTENT } from "./types";

export async function loader(_: Route.LoaderArgs) {
	let user = requireUser();
	if (user.role !== "admin") throw redirect(href("/"));

	let [stats, lastDaySearch] = await Promise.all([
		queryStats(),
		queryLastDaySearch(),
	]);

	let bindings = getBindings();

	let gh = new GitHub(bindings.env.GH_APP_ID, bindings.env.GH_APP_PEM);
	let result = await gh.sponsors();
	let sponsors = result.node.sponsorshipsAsMaintainer.nodes.map(
		(n) => n.sponsorEntity,
	);

	return ok({ stats, lastDaySearch, sponsors });
}

export async function action({ request }: Route.ActionArgs) {
	let user = requireUser();
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

			await createQuickLike(url, user.id);
			throw redirect("/cms");
		} catch (error) {
			if (error instanceof Response) throw error;
			if (error instanceof z.ZodError) {
				return badRequest({
					intent: INTENT.createLike,
					errors: error.issues.reduce(
						(errors, issue) => {
							let [path] = issue.path;
							if (path) errors[path] = issue.message;
							return errors;
						},
						{} as Record<string, string>,
					),
				});
			}

			if (error instanceof Error) {
				return badRequest({
					intent: INTENT.createLike,
					errors: { url: error.message },
				});
			}

			throw error;
		}
	}

	if (formData.get("intent") === INTENT.dump) {
		try {
			let bindings = getBindings();
			let dump = await bindings.db.dump();
			let date = new Date();
			await bindings.fs.backups.put(`${date.toISOString()}.sql`, dump);
			return ok({ intent: INTENT.dump });
		} catch (error) {
			let intent = "Failed to dump database.";
			if (error instanceof Error) intent = error.message;
			return badRequest({ intent: INTENT.dump, errors: { intent } });
		}
	}

	throw redirect(href("/cms"));
}

export default function Component({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	return (
		<div className="flex flex-col gap-8">
			<Stats stats={loaderData.stats} />
			<div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
				<div className="flex flex-col gap-5">
					<CreateLike actionData={actionData} />
					<DumpDatabase actionData={actionData} />
				</div>

				<div className="col-span-2">
					<LastDaySearch result={loaderData.lastDaySearch} />
				</div>
			</div>
		</div>
	);
}
