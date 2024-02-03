import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { redirect, json } from "@remix-run/cloudflare";
import { z } from "zod";

import { Tutorial } from "~/models/tutorial.server";
import { I18n } from "~/modules/i18n.server";
import { Logger } from "~/modules/logger.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";
import { Link } from "~/ui/Link";
import { assertUUID } from "~/utils/uuid";

import { ImportTutorials } from "./import-tutorials";
import { deleteTutorial, importTutorials, resetTutorials } from "./queries";
import { ResetTutorials } from "./reset-tutorials";
import { TutorialList } from "./tutorial-list";
import { INTENT } from "./types";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	let db = database(context.db);

	let tutorials = await Tutorial.list({ db });

	let locale = await new I18n().getLocale(request);

	return json({
		tutorials: tutorials.map((tutorial) => {
			return {
				id: tutorial.id,
				title: tutorial.title,
				path: tutorial.pathname,
				tags: tutorial.tags,
				date: tutorial.createdAt.toLocaleDateString(locale, {
					year: "numeric",
					month: "short",
					day: "numeric",
				}),
			};
		}),
	});
}

export async function action({ request, context }: ActionFunctionArgs) {
	void new Logger(context).http(request);

	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	let formData = await request.formData();
	let intent = z
		.enum([INTENT.import, INTENT.reset, INTENT.delete])
		.parse(formData.get("intent"));

	try {
		if (intent === INTENT.import) await importTutorials(context, user);
		if (intent === INTENT.reset) await resetTutorials(context);
		if (intent === INTENT.delete) {
			let id = formData.get("id");
			assertUUID(id);
			await deleteTutorial(context, id);
		}

		throw redirect("/cms/tutorials");
	} catch (exception) {
		if (exception instanceof Response) throw exception;
		if (exception instanceof Error) console.error(exception);
		throw redirect("/cms/tutorials");
	}
}

export default function Component() {
	return (
		<div className="flex flex-col gap-8 pb-10">
			<header className="flex justify-between gap-4 px-5">
				<h2 className="text-3xl font-bold">Tutorials</h2>

				<div className="flex items-center gap-4">
					<Link href="/cms/tutorials/new">Write Article</Link>

					<ImportTutorials />
					<ResetTutorials />
				</div>
			</header>

			<TutorialList />
		</div>
	);
}
