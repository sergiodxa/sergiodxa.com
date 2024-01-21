import type { FormProps } from "@remix-run/react";

import { Form as RemixForm } from "@remix-run/react";
import { twMerge } from "tailwind-merge";

export function Form(props: FormProps) {
	return (
		<RemixForm
			{...props}
			className={twMerge("flex flex-col gap-4", props.className)}
		/>
	);
}
