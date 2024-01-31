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

	return json({ glossary: glossary.map((g) => g.toJSON()) });
}

export default function Component() {
	let { glossary } = useLoaderData<typeof loader>();
	let t = useT("glossary");

	return (
		<main className="mx-auto max-w-screen-sm space-y-2">
			<PageHeader t={t} />

			<div className="flex flex-col gap-y-4">
				<dl className="space-y-2">
					{glossary.map((term) => (
						<div key={term.id}>
							<dt className="text-xl font-bold">{term.term}</dt>
							<dd>{term.definition}</dd>
						</div>
					))}
				</dl>
			</div>
		</main>
	);
}
