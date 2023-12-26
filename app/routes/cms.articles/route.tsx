import { redirect, type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import {
	Cell,
	Column,
	Row,
	Table,
	TableBody,
	TableHeader,
} from "react-aria-components";

import { useT } from "~/helpers/use-i18n.hook";
import { Article } from "~/models/db-article.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";

import { importArticles } from "./queries";

export async function loader({ request, context }: LoaderFunctionArgs) {
	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	let db = database(context.db);

	await importArticles(context, user);

	let articles = await Article.list({ db });

	return json({ articles: articles.map((article) => article.toJSON()) });
}

export default function Component() {
	return (
		<>
			<header className="flex justify-between">
				<h2 className="text-3xl font-bold">Articles</h2>
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
