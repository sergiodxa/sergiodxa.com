import { useId } from "react";
import { Form } from "react-router";
import { z } from "zod";
import { ok } from "~/helpers/response";
import { getBindings } from "~/middleware/bindings";
import type { Route } from "./+types/route";
import { RedirectsList } from "./components/list";

export async function loader(_: Route.LoaderArgs) {
	let bindings = getBindings();
	let { keys } = await bindings.kv.redirects.list();
	let list = z
		.object({ from: z.string(), to: z.string() })
		.array()
		.parse(keys.map((key) => key.metadata));

	return ok({ list });
}

export default function Component({ loaderData }: Route.ComponentProps) {
	let id = useId();

	return (
		<div className="flex flex-col gap-8 pb-10">
			<header className="flex justify-between gap-4 px-5">
				<h2 className="text-3xl font-bold">Redirects</h2>

				{/* <div className="flex items-center gap-4">
				</div> */}
			</header>

			<Form method="post" id={id}>
				<RedirectsList list={loaderData.list} />
			</Form>
		</div>
	);
}
