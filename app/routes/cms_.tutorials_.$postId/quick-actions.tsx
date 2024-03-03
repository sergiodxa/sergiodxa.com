import type { action } from "./route";
import type { Actions } from "../components.editor/use-editor";

import { useFetcher } from "@remix-run/react";
import { Brush, ImagePlus } from "lucide-react";
import { useEffect, type Dispatch } from "react";
import { TooltipTrigger } from "react-aria-components";

import { Button } from "~/ui/Button";
import { Toolbar } from "~/ui/Toolbar";
import { Tooltip } from "~/ui/Tooltip";

type QuickActionsProps = {
	dispatch: Dispatch<Actions>;
};

export function QuickActions({ dispatch }: QuickActionsProps) {
	let prettify = useFetcher<typeof action>();

	let value = prettify.data?.content;

	useEffect(() => {
		if (value) dispatch({ type: "write", payload: { value } });
	}, [dispatch, value]);

	return (
		<Toolbar
			orientation="vertical"
			className="rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800"
		>
			<TooltipTrigger>
				<Button
					type="button"
					variant="icon"
					aria-label="Upload image"
					className="size-10"
				>
					<ImagePlus className="size-4" />
				</Button>
				<Tooltip placement="left">Upload image</Tooltip>
			</TooltipTrigger>

			<TooltipTrigger>
				<Button
					type="button"
					variant="icon"
					aria-label="Prettify"
					className="size-10"
					onPress={(event) => {
						if (
							event.target instanceof HTMLButtonElement &&
							event.target.form
						) {
							let formData = new FormData(event.target.form);
							formData.set("intent", "prettify");
							prettify.submit(formData, { method: "post" });
						}
					}}
				>
					<Brush className="size-4" />
				</Button>
				<Tooltip placement="left">Prettify</Tooltip>
			</TooltipTrigger>
		</Toolbar>
	);
}
