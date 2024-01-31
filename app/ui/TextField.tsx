import type {
	TextFieldProps as AriaTextFieldProps,
	ValidationResult,
} from "react-aria-components";

import { TextField as AriaTextField } from "react-aria-components";
import { tv } from "tailwind-variants";

import {
	Description,
	FieldError,
	Input,
	Label,
	TextArea,
	fieldBorderStyles,
} from "./Field";
import { composeTailwindRenderProps, focusRing } from "./utils";

const inputStyles = tv({
	extend: focusRing,
	base: "border-2 rounded-md",
	variants: {
		isFocused: fieldBorderStyles.variants.isFocusWithin,
		...fieldBorderStyles.variants,
	},
});

export interface TextFieldProps extends AriaTextFieldProps {
	label?: string;
	description?: string;
	errorMessage?: string | ((validation: ValidationResult) => string);
	type?: AriaTextFieldProps["type"] | "textarea";
}

export function TextField({
	label,
	description,
	errorMessage,
	type,
	...props
}: TextFieldProps) {
	return (
		<AriaTextField
			{...props}
			type={type === "textarea" ? "text" : type}
			className={composeTailwindRenderProps(
				props.className,
				"flex flex-col gap-1",
			)}
		>
			{label && <Label>{label}</Label>}
			{type === "textarea" ? (
				<TextArea className={inputStyles} rows={5} />
			) : (
				<Input className={inputStyles} />
			)}
			{description && <Description>{description}</Description>}
			<FieldError>{errorMessage}</FieldError>
		</AriaTextField>
	);
}
