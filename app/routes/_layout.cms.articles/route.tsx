import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { redirect, json } from "@remix-run/cloudflare";
import { Link, useSubmit } from "@remix-run/react";
import { Button, Form, Input, Label, NumberField } from "react-aria-components";
import { z } from "zod";

import { useT } from "~/helpers/use-i18n.hook";
import { Article } from "~/models/article.server";
import { I18n } from "~/modules/i18n.server";
import { Logger } from "~/modules/logger.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";

import { ArticleList } from "./article-list";
import { importArticles, resetArticles } from "./queries";

const INTENT = {
	import: "IMPORT_ARTICLES" as const,
	reset: "RESET_ARTICLES" as const,
};

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
	let intent = z
		.enum([INTENT.import, INTENT.reset])
		.parse(formData.get("intent"));

	if (intent === INTENT.import) {
		let page = z.coerce.number().parse(formData.get("page"));
		await importArticles(context, user, page);
	}

	if (intent === INTENT.reset) await resetArticles(context);

	throw redirect("/cms/articles");
}

export default function Component() {
	return (
		<div className="flex flex-col gap-8 pb-10">
			<header className="flex justify-between gap-4 px-5">
				<h2 className="text-3xl font-bold">Articles</h2>

				<div className="flex items-center gap-4">
					<Link
						to="/cms/articles/new"
						className="block flex-shrink-0 rounded-md border-2 border-blue-600 bg-blue-100 px-4 py-2 text-center text-base font-medium text-blue-900 no-underline visited:text-blue-900"
					>
						Write Article
					</Link>

					<ImportArticles />
					<ResetArticles />
				</div>
			</header>

			<ArticleList />
		</div>
	);
}

function ImportArticles() {
	let submit = useSubmit();
	let t = useT("cms.articles.import");

	return (
		<Form
			method="post"
			className="flex items-center gap-1"
			onSubmit={(event) => {
				event.preventDefault();
				submit(event.currentTarget);
			}}
		>
			<input type="hidden" name="intent" value={INTENT.import} />
			<NumberField name="page">
				<Label className="sr-only">Page</Label>
				<Input
					name="page"
					className="w-full rounded-md border-2 border-blue-600 bg-white px-4 py-2 text-base"
				/>
			</NumberField>
			<Button
				type="submit"
				className="block flex-shrink-0 rounded-md border-2 border-blue-600 bg-blue-100 px-4 py-2 text-center text-base font-medium text-blue-900"
			>
				{t("cta")}
			</Button>
		</Form>
	);
}

function ResetArticles() {
	let submit = useSubmit();
	let t = useT("cms.articles.reset");

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
