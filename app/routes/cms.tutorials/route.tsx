import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { redirect, json } from "@remix-run/cloudflare";
import { Link, useSubmit } from "@remix-run/react";
import { Button, Form } from "react-aria-components";
import { z } from "zod";

import { useT } from "~/helpers/use-i18n.hook";
import { Tutorial } from "~/models/db-tutorial.server";
import { I18n } from "~/modules/i18n.server";
import { Logger } from "~/modules/logger.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";

import { importTutorials, resetTutorials } from "./queries";
import { TutorialList } from "./tutorial-list";

const INTENT = {
	import: "IMPORT_TUTORIALS" as const,
	reset: "RESET_TUTORIALS" as const,
};

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
		.enum([INTENT.import, INTENT.reset])
		.parse(formData.get("intent"));

	try {
		if (intent === INTENT.import) await importTutorials(context, user);
		if (intent === INTENT.reset) await resetTutorials(context);

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
					<Link
						to="/cms/tutorials/new"
						className="block flex-shrink-0 rounded-md border-2 border-blue-600 bg-blue-100 px-4 py-2 text-center text-base font-medium text-blue-900 no-underline visited:text-blue-900"
					>
						Write Article
					</Link>

					{<ImportTutorials />}
					{<ResetTutorials />}
				</div>
			</header>

			<TutorialList />
		</div>
	);
}

function ImportTutorials() {
	let submit = useSubmit();
	let t = useT("cms.tutorials.import");

	return (
		<Form
			method="post"
			onSubmit={(event) => {
				event.preventDefault();
				submit(event.currentTarget);
			}}
		>
			<input type="hidden" name="intent" value={INTENT.import} />
			<Button
				type="submit"
				className="block flex-shrink-0 rounded-md border-2 border-blue-600 bg-blue-100 px-4 py-2 text-center text-base font-medium text-blue-900"
			>
				{t("cta")}
			</Button>
		</Form>
	);
}

function ResetTutorials() {
	let submit = useSubmit();
	let t = useT("cms.tutorials.reset");

	return (
		<Form
			method="post"
			onSubmit={(event) => {
				event.preventDefault();
				submit(event.currentTarget);
			}}
		>
			<input type="hidden" name="intent" value={INTENT.reset} />
			<Button
				type="submit"
				className="block flex-shrink-0 rounded-md border-2 border-blue-600 bg-blue-100 px-4 py-2 text-center text-base font-medium text-blue-900"
			>
				{t("cta")}
			</Button>
		</Form>
	);
}
