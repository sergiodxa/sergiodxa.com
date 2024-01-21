import type { ToolbarProps } from "react-aria-components";

import {
	Toolbar as RACToolbar,
	composeRenderProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";

const styles = tv({
	base: "flex gap-2",
	variants: {
		orientation: {
			horizontal: "flex-row",
			vertical: "flex-col items-start",
		},
	},
});

export function Toolbar(props: ToolbarProps) {
	return (
		<RACToolbar
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				styles({ ...renderProps, className }),
			)}
		/>
	);
}
