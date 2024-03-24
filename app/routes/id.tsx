import { createId } from "@paralleldrive/cuid2";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { useId } from "react";

export function loader() {
	return json({
		uuid: crypto.randomUUID(),
		cuid: createId(),
	});
}

export default function Component() {
	let { uuid, cuid } = useLoaderData<typeof loader>();
	let id = useId();

	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-center gap-6 font-mono">
			<div className="flex w-full max-w-screen-sm flex-col gap-2">
				<label
					htmlFor={`uuid-${id}`}
					className="text-xl font-bold tracking-wide"
				>
					UUID
				</label>
				<output
					id={`uuid-${id}`}
					className="select-all bg-zinc-200 p-4 dark:bg-zinc-800"
				>
					{uuid}
				</output>
			</div>

			<div className="flex w-full max-w-screen-sm flex-col gap-2">
				<label
					htmlFor={`cuid-${id}`}
					className="text-xl font-bold tracking-wide"
				>
					CUID
				</label>
				<output
					id={`cuid-${id}`}
					className="select-all bg-zinc-200 p-4 dark:bg-zinc-800"
				>
					{cuid}
				</output>
			</div>
		</main>
	);
}
