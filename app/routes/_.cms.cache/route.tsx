import { useId } from "react";
import { href, redirect } from "react-router";
import { z } from "zod";
import { ok } from "~/helpers/response";
import { getCache } from "~/middleware/cache";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import type { Route } from "./+types/route";
import { CacheKeyList } from "./components/list";
import { INTENT } from "./types";

export async function loader(_: Route.LoaderArgs) {
	let cache = getCache();
	let keys = await cache.list();
	return ok({ keys });
}

export async function action({ request }: Route.ActionArgs) {
	let cache = getCache();
	let formData = await request.formData();

	if (formData.get("intent") === INTENT.clear) {
		let keys = await cache.list();
		await Promise.all(keys.map((key) => cache.delete(key)));
	}

	if (formData.get("intent") === INTENT.deleteSelected) {
		let keys = z.string().array().parse(formData.getAll("key"));
		await Promise.all(keys.map((key) => cache.delete(key)));
	}

	return redirect(href("/cms/cache"));
}

export default function Component({ loaderData }: Route.ComponentProps) {
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
				<CacheKeyList keys={loaderData.keys} />
			</Form>
		</div>
	);
}
