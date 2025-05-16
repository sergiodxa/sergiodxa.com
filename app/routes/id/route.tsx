import { createId } from "@paralleldrive/cuid2";
import { useId } from "react";
import { useRevalidator } from "react-router";
import { monotonicFactory } from "ulidx";
import { v7 } from "uuid";
import { ok } from "~/helpers/response";
import { Button } from "~/ui/Button";
import type { Route } from "./+types/route";

export function loader() {
	return ok({
		uuidv4: crypto.randomUUID(),
		uuidv7: v7(),
		cuid: createId(),
		ulid: monotonicFactory()(),
	});
}

export default function Component({ loaderData }: Route.ComponentProps) {
	let revalidator = useRevalidator();

	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-center gap-6 font-mono">
			<Identifier label="UUID v4" value={loaderData.uuidv4} />
			<Identifier label="UUID v7" value={loaderData.uuidv7} />
			<Identifier label="CUID" value={loaderData.cuid} />
			<Identifier label="ULID" value={loaderData.ulid} />
			<Button onPress={() => revalidator.revalidate()}>Reload</Button>
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
