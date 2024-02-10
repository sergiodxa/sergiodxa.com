import { ImagePlus } from "lucide-react";

import { Button } from "~/ui/Button";
import { Toolbar } from "~/ui/Toolbar";

export function QuickActions() {
	return (
		<Toolbar
			orientation="vertical"
			className="rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800"
		>
			<Button
				type="button"
				variant="icon"
				aria-label="Upload image"
				className="size-10"
			>
				<ImagePlus className="size-4" />
			</Button>
		</Toolbar>
	);
}
