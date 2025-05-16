import { href, redirect } from "react-router";
import { z } from "zod";
import { ok } from "~/helpers/response";
import { getDB } from "~/middleware/drizzle";
import { getLocale } from "~/middleware/i18next";
import { Tutorial } from "~/models/tutorial.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { assertUUID } from "~/utils/uuid";
import type { Route } from "./+types/route";
import { TutorialList } from "./components/tutorial-list";
import { deleteTutorial } from "./queries";
import { INTENT } from "./types";

export async function loader(_: Route.LoaderArgs) {
	let db = getDB();
	let tutorials = await Tutorial.list({ db });
	let locale = getLocale();

	return ok({
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

export async function action({ request }: Route.ActionArgs) {
	let formData = await request.formData();
	let intent = z.enum([INTENT.delete]).parse(formData.get("intent"));

	try {
		if (intent === INTENT.delete) {
			let id = formData.get("id");
			assertUUID(id);
			await deleteTutorial(id);
		}

		return redirect(href("/cms/tutorials"));
	} catch (exception) {
		if (exception instanceof Response) throw exception;
		if (exception instanceof Error) console.error(exception);
		return redirect(href("/cms/tutorials"));
	}
}

export default function Component({ loaderData }: Route.ComponentProps) {
	return (
		<div className="flex flex-col gap-8 pb-10">
			<header className="flex justify-between gap-4 px-5">
				<h2 className="text-3xl font-bold">Tutorials</h2>

				<div className="flex items-center gap-4">
					<Form method="get" action="/cms/tutorials/new">
						<Button type="submit" variant="primary">
							Write Tutorial
						</Button>
					</Form>
				</div>
			</header>

			<TutorialList tutorials={loaderData.tutorials} />
		</div>
	);
}
