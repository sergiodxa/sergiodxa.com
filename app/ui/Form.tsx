import type { FormProps as RemixFormProps } from "react-router";

import { FormValidationContext } from "react-aria-components";
import { Form as RemixForm } from "react-router";
import { twMerge } from "tailwind-merge";

export type ValidationErrors = Parameters<
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
