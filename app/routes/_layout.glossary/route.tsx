import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { PageHeader } from "~/components/page-header";
import { useT } from "~/helpers/use-i18n.hook";
import { Glossary } from "~/models/glossary.server";
import { Logger } from "~/modules/logger.server";
import { database } from "~/services/db.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let db = database(context.db);

	let glossary = await Glossary.list({ db });
	glossary = glossary.sort((a, b) => a.term.localeCompare(b.term, "en"));

	return json({ glossary: glossary.map((g) => g.toJSON()) });
}

export default function Component() {
	let { glossary } = useLoaderData<typeof loader>();
	let t = useT("glossary");

	return (
		<main className="mx-auto flex max-w-screen-sm flex-col gap-y-8">
			<PageHeader t={t} />

			<dl className="flex flex-col divide-y divide-zinc-500">
				{glossary.map((term) => (
					<div
						key={term.id}
						id={term.slug}
						className="py-4 target:rounded-md target:bg-zinc-100 target:p-4 target:shadow-md target:ring-2 target:ring-zinc-500 target:ring-opacity-50 target:dark:border-none target:dark:bg-zinc-800 target:dark:text-zinc-100 target:dark:shadow-none target:dark:ring-zinc-400 target:dark:ring-opacity-50"
					>
						<dt className="text-xl font-bold">{term.term}</dt>
						<dd>{term.definition}</dd>
					</div>
				))}
			</dl>
		</main>
	);
}
