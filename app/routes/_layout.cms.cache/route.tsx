import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { redirect, json } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { Button } from "react-aria-components";

import { Cache } from "~/modules/cache.server";
import { Logger } from "~/modules/logger.server";
import { SessionStorage } from "~/modules/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);

	let keys = await cache.list();

	return json({ keys });
}

export async function action({ request, context }: ActionFunctionArgs) {
	void new Logger(context).http(request);

	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);

	let keys = await cache.list();
	await Promise.all(keys.map((key) => cache.delete(key)));

	return redirect("/cms/cache");
}

export default function Component() {
	let { keys } = useLoaderData<typeof loader>();

	return (
		<div className="flex flex-col gap-8 pb-10">
			<header className="flex justify-between gap-4 px-5">
				<h2 className="text-3xl font-bold">Cache Keys</h2>

				<div className="flex items-center gap-4">
					<Form method="post" className="flex items-center gap-1">
						<Button
							type="submit"
							className="block flex-shrink-0 rounded-md border-2 border-blue-600 bg-blue-100 px-4 py-2 text-center text-base font-medium text-blue-900"
						>
							Clear Cache
						</Button>
					</Form>
				</div>
			</header>

			<ul className="flex list-inside list-disc flex-col gap-2 text-lg">
				{keys.map((key) => (
					<li key={key}>
						<h3 className="font-semibold leading-6 text-gray-900 underline">
							{key}
						</h3>
					</li>
				))}
			</ul>
		</div>
	);
}
