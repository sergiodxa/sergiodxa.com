import type { ValidationErrors } from "@react-types/shared";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";
import {
	useActionData,
	useLoaderData,
	useSearchParams,
	useSubmit,
} from "@remix-run/react";
import { parameterize } from "inflected";
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
import { Bookmark } from "~/models/bookmark.server";
import { Like } from "~/models/like.server";
import { I18n } from "~/modules/i18n.server";
import { SessionStorage } from "~/modules/session.server";
import { Airtable } from "~/services/airtable.server";
import { Cache } from "~/services/cache.server";
import { Tables, database } from "~/services/db.server";

const INTENT = { importBookmarks: "IMPORT_BOOKMARKS" };

export async function loader({ request, context }: LoaderFunctionArgs) {
	let likes = await Like.list({ db: database(context.db) });
	let locale = await new I18n().getLocale(request);

	return json({
		likes: likes.map((like) => {
			return {
				...like.toJSON(),
				createdAt: like.createdAt.toLocaleString(locale, {
					dateStyle: "medium",
				}),
				updatedAt: like.updatedAt.toLocaleString(locale, {
					dateStyle: "medium",
				}),
			};
		}),
	});
}

export async function action({ request, context }: ActionFunctionArgs) {
	let user = await SessionStorage.requireUser(context, request, "/auth/login");

	let formData = await request.formData();

	if (formData.get("intent") !== INTENT.importBookmarks) {
		return json<ValidationErrors>(
			{ intent: `Invalid intent ${formData.get("intent")}` },
			400,
		);
	}

	let airtable = new Airtable(
		context.env.AIRTABLE_API_KEY,
		context.env.AIRTABLE_BASE,
		context.env.AIRTABLE_TABLE_ID,
	);

	let cache = new Cache(context.kv.airtable);

	let bookmarks = await Bookmark.list({ airtable, cache });

	try {
		let db = database(context.db);

		await db.delete(Tables.postMeta).execute();
		await db.delete(Tables.posts).execute();
		await db.delete(Tables.postTypes).execute();

		await db
			.insert(Tables.postTypes)
			.values({ name: "likes" })
			.onConflictDoNothing()
			.execute();

		for await (let bookmark of bookmarks) {
			await Like.create(
				{ db },
				{
					slug: parameterize(bookmark.title),
					status: "published",
					authorId: user.id,
					createdAt: new Date(bookmark.createdAt),
					updatedAt: new Date(bookmark.createdAt),
					title: bookmark.title,
					url: new URL(bookmark.url),
				},
			);
		}

		throw redirect("/cms/likes");
	} catch (exception) {
		if (exception instanceof Response) throw exception;
		if (exception instanceof Error) {
			return json({ error: exception.message }, 400);
		}

		console.log(exception);
		throw exception;
	}
}

export default function Component() {
	return (
		<>
			<header className="flex justify-between">
				<h2 className="text-3xl font-bold">Likes</h2>

				<ImportBookmarks />
			</header>

			<SearchForm />
			<LikesTable />
		</>
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
							<Cell className="flex-shrink-0 text-right">{like.createdAt}</Cell>
							<Cell className="flex-shrink-0 text-right">{like.updatedAt}</Cell>
						</Row>
					);
				})}
			</TableBody>
		</Table>
	);
}

function ImportBookmarks() {
	let submit = useSubmit();
	let actionData = useActionData<typeof action>();
	let t = useT("translation", "cms.likes.import");

	return (
		<Form
			method="post"
			onSubmit={(event) => submit(event.currentTarget)}
			validationErrors={actionData}
		>
			{actionData?.error ? <span>{actionData.error}</span> : null}
			<input type="hidden" name="intent" value={INTENT.importBookmarks} />
			<Button
				type="submit"
				className="block flex-shrink-0 rounded-md border-2 border-blue-600 bg-blue-100 px-4 py-2 text-center text-base font-medium text-blue-900"
			>
				{t("cta")}
			</Button>
		</Form>
	);
}
