import type { ClientActionFunctionArgs } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { decode } from "turbo-stream";
import { Fence } from "~/components/md/fence";

export const handle: SDX.Handle = { hydrate: true };

export async function clientAction({ request }: ClientActionFunctionArgs) {
	try {
		// biome-ignore lint/style/noNonNullAssertion: The request always has a body
		let decoded = await decode(request.body!);
		await decoded.done;
		return {
			status: "success" as const,
			value: await Promise.resolve(decoded.value),
		};
	} catch (error) {
		console.error(error);
		return { status: "failure" as const };
	}
}

export default function Component() {
	let { submit, data } = useFetcher<typeof clientAction>();

	return (
		<main className="h-screen w-full font-mono p-8 grid grid-cols-3 gap-8">
			<textarea
				className="w-full h-full overflow-auto p-2 resize-none bg-slate-50 dark:bg-slate-950 rounded-lg"
				onChange={(event) => {
					submit(event.currentTarget.value, {
						method: "POST",
						encType: "application/json",
					});
				}}
			/>
			<output
				className="whitespace-pre-wrap w-full h-full overflow-auto col-span-2 p-2"
				style={{ tabSize: 2 }}
			>
				<Fence language="json" content={JSON.stringify(data, null, "\t")} />
			</output>
		</main>
	);
}
