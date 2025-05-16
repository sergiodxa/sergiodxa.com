import { href, redirect } from "react-router";
import { z } from "zod";
import { ok } from "~/helpers/response";
import { getDB } from "~/middleware/drizzle";
import { getLocale } from "~/middleware/i18next";
import { Article } from "~/models/article.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { assertUUID } from "~/utils/uuid";
import type { Route } from "./+types/route";
import { ArticlesList } from "./components/article-list";
import { deleteArticle, moveToTutorial } from "./queries";
import { INTENT } from "./types";

export async function loader(_: Route.LoaderArgs) {
	let db = getDB();
	let articles = await Article.list({ db });
	let locale = getLocale();

	return ok({
		articles: articles.map((article) => {
			return {
				id: article.id,
				title: article.title,
				path: article.pathname,
				date: article.createdAt.toLocaleDateString(locale, {
					year: "numeric",
					month: "short",
					day: "numeric",
				}),
			};
		}),
	});
}

export async function action({ request, context }: Route.ActionArgs) {
	let formData = await request.formData();
	let intent = z
		.enum([INTENT.delete, INTENT.moveToTutorial])
		.parse(formData.get("intent"));

	try {
		if (intent === INTENT.delete) {
			let id = formData.get("id");
			assertUUID(id);
			await deleteArticle(id);
		}

		if (intent === INTENT.moveToTutorial) {
			let id = formData.get("id");
			assertUUID(id);
			await moveToTutorial(id);
		}

		throw redirect(href("/cms/articles"));
	} catch (exception) {
		if (exception instanceof Response) throw exception;
		if (exception instanceof Error) console.error(exception);
		throw redirect(href("/cms/articles"));
	}
}

export default function Component({ loaderData }: Route.ComponentProps) {
	return (
		<div className="flex flex-col gap-8 pb-10">
			<header className="flex justify-between gap-4 px-5">
				<h2 className="text-3xl font-bold">Articles</h2>

				<div className="flex items-center gap-4">
					<Form method="get" action="/cms/articles/new">
						<Button type="submit" variant="primary">
							Write Article
						</Button>
					</Form>
				</div>
			</header>

			<ArticlesList articles={loaderData.articles} />
		</div>
	);
}
