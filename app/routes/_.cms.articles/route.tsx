import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";
import { z } from "zod";

import { I18n } from "~/modules/i18n.server";
import { Logger } from "~/modules/logger.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { assertUUID } from "~/utils/uuid";

import { Article } from "~/models/article.server";
import { ArticlesList } from "./article-list";
import { deleteArticle } from "./queries";
import { INTENT } from "./types";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	let db = database(context.db);

	let articles = await Article.list({ db });

	let locale = await new I18n().getLocale(request);

	return json({
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

export async function action({ request, context }: ActionFunctionArgs) {
	void new Logger(context).http(request);

	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	let formData = await request.formData();
	let intent = z.enum([INTENT.delete]).parse(formData.get("intent"));

	try {
		if (intent === INTENT.delete) {
			let id = formData.get("id");
			assertUUID(id);
			await deleteArticle(context, id);
		}

		throw redirect("/cms/articles");
	} catch (exception) {
		if (exception instanceof Response) throw exception;
		if (exception instanceof Error) console.error(exception);
		throw redirect("/cms/articles");
	}
}

export default function Component() {
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

			<ArticlesList />
		</div>
	);
}
