import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams, useSubmit } from "@remix-run/react";
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

import { useT } from "~/helpers/use-i18n.hook";
import { Like } from "~/models/like.server";
import { database } from "~/services/db.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	let likes = await Like.list({ db: database(context.db) });
	return json({
		likes: likes.map((like) => like.toJSON()),
	});
}

export default function Component() {
	return (
		<main className="mx-auto flex max-w-screen-xl flex-col gap-8">
			<h2 className="text-3xl font-bold">Likes</h2>

			<SearchForm />
			<LikesTable />
		</main>
	);
}

function SearchForm() {
	let [searchParams] = useSearchParams();
	let submit = useSubmit();
	let t = useT("translation", "cms.likes.search");

	return (
		<Form
			method="get"
			action="/cms/likes"
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

function LikesTable() {
	let { likes } = useLoaderData<typeof loader>();
	let t = useT("translation", "cms.likes.table");

	return (
		<Table aria-label="Users" className="w-full">
			<TableHeader>
				<Column className="text-left" isRowHeader>
					{t("header.title")}
				</Column>
				<Column className="text-left">{t("header.url")}</Column>
				<Column className="text-right">{t("header.createdAt")}</Column>
				<Column className="text-right">{t("header.updatedAt")}</Column>
			</TableHeader>

			<TableBody>
				{likes.map((like) => {
					return (
						<Row key={like.id}>
							<Cell>{like.title}</Cell>
							<Cell>{like.url}</Cell>
							<Cell className="text-right">{like.createdAt}</Cell>
							<Cell className="text-right">{like.updatedAt}</Cell>
						</Row>
					);
				})}
			</TableBody>
		</Table>
	);
}
