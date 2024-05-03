import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";
import { useId } from "react";
import { z } from "zod";

import { Cache } from "~/modules/cache.server";
import { Logger } from "~/modules/logger.server";
import { SessionStorage } from "~/modules/session.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";

import { CacheKeyList } from "./list";
import { INTENT } from "./types";

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

	let formData = await request.formData();

	if (formData.get("intent") === INTENT.clear) {
		let keys = await cache.list();
		await Promise.all(keys.map((key) => cache.delete(key)));
	}

	if (formData.get("intent") === INTENT.deleteSelected) {
		let keys = z.string().array().parse(formData.getAll("key"));
		await Promise.all(keys.map((key) => cache.delete(key)));
	}

	return redirect("/cms/cache");
}

export default function Component() {
	let id = useId();

	return (
		<div className="flex flex-col gap-8 pb-10">
			<header className="flex justify-between gap-4 px-5">
				<h2 className="text-3xl font-bold">Cache Keys</h2>

				<div className="flex items-center gap-4">
					<Form method="post">
						<Button
							type="submit"
							name="intent"
							value={INTENT.clear}
							variant="primary"
						>
							Clear Cache
						</Button>
					</Form>

					<Button
						type="submit"
						name="intent"
						value={INTENT.deleteSelected}
						form={id}
						variant="secondary"
					>
						Delete Selected
					</Button>
				</div>
			</header>

			<Form method="post" id={id}>
				<CacheKeyList />
			</Form>
		</div>
	);
}
