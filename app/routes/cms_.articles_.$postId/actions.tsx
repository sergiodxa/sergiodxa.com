import type { loader } from "./route";

import { useLoaderData } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";

import { Button } from "~/ui/Button";
import { Link } from "~/ui/Link";
import { Toolbar } from "~/ui/Toolbar";

export function Actions() {
	let loaderData = useLoaderData<typeof loader>();

	return (
		<Toolbar className="rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
			<Link href="/cms/articles" className="flex items-center gap-1">
				<ArrowLeft className="size-5" />
				<span>Go back</span>
			</Link>
			<div className="flex-grow" />
			<Button
				type="submit"
				variant="primary"
				name="intent"
				value={loaderData.mode}
			>
				Save
			</Button>
		</Toolbar>
	);
}
