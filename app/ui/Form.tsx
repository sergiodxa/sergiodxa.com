import type { FormProps as RemixFormProps } from "@remix-run/react";

import { Form as RemixForm } from "@remix-run/react";
import { FormValidationContext } from "react-aria-components";
import { twMerge } from "tailwind-merge";

type ValidationErrors = Parameters<
	typeof FormValidationContext.Provider
>[0]["value"];

interface FormProps extends RemixFormProps {
	errors?: ValidationErrors;
}

export function Form({ errors = {}, ...props }: FormProps) {
	return (
		<FormValidationContext.Provider value={errors}>
			<RemixForm
				{...props}
				className={twMerge("flex flex-col gap-4", props.className)}
			/>
		</FormValidationContext.Provider>
	);
}
