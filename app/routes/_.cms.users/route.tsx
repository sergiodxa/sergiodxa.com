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
import { useTranslation } from "react-i18next";
import { useSearchParams, useSubmit } from "react-router";
import { z } from "zod";
import * as schema from "~/db/schema";
import { ok } from "~/helpers/response";
import { getDB } from "~/middleware/drizzle";
import { getLocale } from "~/middleware/i18next";
import type { Route } from "./+types/route";

export async function loader({ request }: Route.LoaderArgs) {
	let db = getDB();

	let url = new URL(request.url);

	let query = z.string().nullable().parse(url.searchParams.get("q")) ?? "";

	let users = await db.query.users.findMany({
		where: query ? eq(schema.users.displayName, query) : undefined,
	});

	let locale = getLocale();

	return ok({
		users: users.map((user) => ({
			...user,
			createdAt: user.createdAt.toLocaleDateString(locale),
			updatedAt: user.updatedAt.toLocaleDateString(locale),
		})),
	});
}

export default function Component({ loaderData }: Route.ComponentProps) {
	return (
		<main className="mx-auto flex max-w-screen-lg flex-col gap-8">
			<h2 className="text-3xl font-bold">Users</h2>

			<SearchForm />
			<UsersTable users={loaderData.users} />
		</main>
	);
}

function SearchForm() {
	let [searchParams] = useSearchParams();
	let submit = useSubmit();
	let { t } = useTranslation("translation", { keyPrefix: "cms.users.search" });

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

function UsersTable({
	users,
}: Pick<Route.ComponentProps["loaderData"], "users">) {
	let { t } = useTranslation("translation", { keyPrefix: "cms.users.table" });

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
