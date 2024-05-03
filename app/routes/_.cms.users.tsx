import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams, useSubmit } from "@remix-run/react";
import { eq } from "drizzle-orm";
import {
	Button,
	Cell,
	Column,
	Form,
	Input,
	Label,
	Row,
	SearchField,
	Table,
	TableBody,
	TableHeader,
} from "react-aria-components";
import { z } from "zod";

import { useT } from "~/helpers/use-i18n.hook";
import { Tables, database } from "~/services/db.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	let db = database(context.db);

	let url = new URL(request.url);

	let query = z.string().nullable().parse(url.searchParams.get("q")) ?? "";

	let users = await db.query.users.findMany({
		where: query ? eq(Tables.users.displayName, query) : undefined,
	});

	return json({ users });
}

export default function Component() {
	return (
		<main className="mx-auto flex max-w-screen-lg flex-col gap-8">
			<h2 className="text-3xl font-bold">Users</h2>

			<SearchForm />
			<UsersTable />
		</main>
	);
}

function SearchForm() {
	let [searchParams] = useSearchParams();
	let submit = useSubmit();
	let t = useT("cms.users.search");

	return (
		<Form
			method="get"
			action="/cms/users"
			onSubmit={(event) => submit(event.currentTarget)}
			className="flex gap-4"
		>
			<SearchField
				name="q"
				type="text"
				defaultValue={searchParams.get("q") ?? undefined}
				onBlur={(event) => {
					let target = event.currentTarget;
					if (target instanceof HTMLInputElement) submit(target.form);
				}}
				onInput={(event) => {
					let target = event.currentTarget;
					if (target instanceof HTMLInputElement) submit(target.form);
				}}
				className="contents"
			>
				<Label className="sr-only">{t("label")}</Label>
				<Input className="rounded-md border-2 border-blue-600 px-3 py-1" />
			</SearchField>

			<Button
				type="submit"
				className="block flex-shrink-0 rounded-md border-2 border-blue-600 bg-blue-100 px-4 py-2 text-center text-base font-medium text-blue-900"
			>
				{t("cta")}
			</Button>
		</Form>
	);
}

function UsersTable() {
	let { users } = useLoaderData<typeof loader>();
	let t = useT("cms.users.table");

	return (
		<Table aria-label="Users" className="w-full">
			<TableHeader>
				<Column className="text-left" isRowHeader>
					{t("header.name")}
				</Column>
				<Column className="text-left">{t("header.role")}</Column>
				<Column className="text-left">{t("header.email")}</Column>
				<Column className="text-right">{t("header.createdAt")}</Column>
				<Column className="text-right">{t("header.updatedAt")}</Column>
			</TableHeader>

			<TableBody>
				{users.map((user) => {
					return (
						<Row key={user.id}>
							<Cell>{user.displayName}</Cell>
							<Cell>{user.role}</Cell>
							<Cell>{user.email}</Cell>
							<Cell className="text-right">{user.createdAt}</Cell>
							<Cell className="text-right">{user.updatedAt}</Cell>
						</Row>
					);
				})}
			</TableBody>
		</Table>
	);
}
