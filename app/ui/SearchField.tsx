import type {
	SearchFieldProps as AriaSearchFieldProps,
	ValidationResult,
} from "react-aria-components";

import { SearchIcon, XIcon } from "lucide-react";
import { SearchField as AriaSearchField } from "react-aria-components";

import { Button } from "./Button";
import { Description, FieldError, FieldGroup, Input, Label } from "./Field";
import { composeTailwindRenderProps } from "./utils";

export interface SearchFieldProps extends AriaSearchFieldProps {
	label?: string;
	description?: string;
	errorMessage?: string | ((validation: ValidationResult) => string);
	placeholder?: string;
}

export function SearchField({
	label,
	description,
	errorMessage,
	placeholder,
	...props
}: SearchFieldProps) {
	return (
		<AriaSearchField
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"group flex min-w-[40px] flex-col gap-1",
			)}
		>
			{label && <Label>{label}</Label>}
			<FieldGroup>
				<SearchIcon
					aria-hidden
					className="ml-2 h-4 w-4 text-gray-500 group-disabled:text-gray-200 dark:text-zinc-400 dark:group-disabled:text-zinc-600 forced-colors:text-[ButtonText] forced-colors:group-disabled:text-[GrayText]"
				/>
				<Input
					className="[&::-webkit-search-cancel-button]:hidden"
					placeholder={placeholder}
				/>
				<Button variant="icon" className="mr-1 w-6 group-empty:invisible">
					<XIcon aria-hidden className="h-4 w-4" />
				</Button>
			</FieldGroup>
			{description && <Description>{description}</Description>}
			<FieldError>{errorMessage}</FieldError>
		</AriaSearchField>
	);
}
