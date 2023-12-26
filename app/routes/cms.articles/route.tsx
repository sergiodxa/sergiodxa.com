import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { redirect, json } from "@remix-run/cloudflare";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import {
	Button,
	Cell,
	Column,
	Form,
	Row,
	Table,
	TableBody,
	TableHeader,
} from "react-aria-components";

import { useT } from "~/helpers/use-i18n.hook";
import { Article } from "~/models/db-article.server";
import { Logger } from "~/modules/logger.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";

import { importArticles } from "./queries";

const INTENT = { importArticles: "IMPORT_ARTICLES" };

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	let db = database(context.db);

	void new Logger(context).info("listing articles");

	let articles = await Article.list({ db });

	void new Logger(context).info(`queried ${articles.length} articles`);

	return json({ articles: articles.map((article) => article.toJSON()) });
}

export async function action({ request, context }: ActionFunctionArgs) {
	void new Logger(context).http(request);

	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	await importArticles(context, user);

	throw redirect("/cms/articles");
}

export default function Component() {
	return (
		<>
			<header className="flex justify-between">
				<h2 className="text-3xl font-bold">Articles</h2>
				<ImportArticles />
			</header>

			<ArticlesTable />
		</>
	);
}

function ArticlesTable() {
	let { articles } = useLoaderData<typeof loader>();
	let t = useT("translation", "cms.articles.table");

	return (
		<Table aria-label="Users" className="w-full">
			<TableHeader>
				<Column className="text-left" isRowHeader>
					{t("header.title")}
				</Column>
				<Column className="text-right">{t("header.createdAt")}</Column>
				<Column className="text-right">{t("header.updatedAt")}</Column>
			</TableHeader>

			<TableBody>
				{articles.map((article) => {
					return (
						<Row key={article.id} className="py-2">
							<Cell className="flex flex-col">
								<a href={`/articles/${article.slug}`}>{article.title}</a>
								<p>{article.excerpt}</p>
							</Cell>
							<Cell className="flex-shrink-0 text-right">
								{article.createdAt}
							</Cell>
							<Cell className="flex-shrink-0 text-right">
								{article.updatedAt}
							</Cell>
						</Row>
					);
				})}
			</TableBody>
		</Table>
	);
}

function ImportArticles() {
	let submit = useSubmit();
	let actionData = useActionData<typeof action>();
	let t = useT("translation", "cms.articles.import");

	return (
		<Form
			method="post"
			onSubmit={(event) => {
				event.preventDefault();
				submit(event.currentTarget);
			}}
			validationErrors={actionData ?? undefined}
		>
			<input type="hidden" name="intent" value={INTENT.importArticles} />
			<Button
				type="submit"
				className="block flex-shrink-0 rounded-md border-2 border-blue-600 bg-blue-100 px-4 py-2 text-center text-base font-medium text-blue-900"
			>
				{t("cta")}
			</Button>
		</Form>
	);
}
