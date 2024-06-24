import { createId } from "@paralleldrive/cuid2";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { useId } from "react";
import { monotonicFactory } from "ulidx";
import { v7 } from "uuid";

export function loader() {
	return json({
		uuidv4: crypto.randomUUID(),
		uuidv7: v7(),
		cuid: createId(),
		ulid: monotonicFactory()(),
	});
}

export default function Component() {
	let { uuidv4, uuidv7, cuid, ulid } = useLoaderData<typeof loader>();

	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-center gap-6 font-mono">
			<Identifier label="UUID v4" value={uuidv4} />
			<Identifier label="UUID v7" value={uuidv7} />
			<Identifier label="CUID" value={cuid} />
			<Identifier label="ULID" value={ulid} />
		</main>
	);
}

function Identifier({ label, value }: { label: string; value: string }) {
	let id = useId();
	return (
		<div className="flex w-full max-w-screen-sm flex-col gap-2">
			<label htmlFor={id} className="text-xl font-bold tracking-wide">
				{label}
			</label>
			<output id={id} className="select-all bg-zinc-200 p-4 dark:bg-zinc-800">
				{value}
			</output>
		</div>
	);
}
