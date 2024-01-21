import type { DropdownSectionProps } from "./ListBox";
import type {
	ComboBoxProps as AriaComboBoxProps,
	ListBoxItemProps,
	ValidationResult,
} from "react-aria-components";

import { ChevronDown } from "lucide-react";
import { ComboBox as AriaComboBox, ListBox } from "react-aria-components";

import { Button } from "./Button";
import { Description, FieldError, FieldGroup, Input, Label } from "./Field";
import { DropdownItem, DropdownSection } from "./ListBox";
import { Popover } from "./Popover";
import { composeTailwindRenderProps } from "./utils";

export interface ComboBoxProps<T extends object>
	extends Omit<AriaComboBoxProps<T>, "children"> {
	label?: string;
	description?: string | null;
	errorMessage?: string | ((validation: ValidationResult) => string);
	children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function ComboBox<T extends object>({
	label,
	description,
	errorMessage,
	children,
	items,
	...props
}: ComboBoxProps<T>) {
	return (
		<AriaComboBox
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"group flex flex-col gap-1",
			)}
		>
			<Label>{label}</Label>
			<FieldGroup>
				<Input />
				<Button variant="icon" className="mr-1 w-6 rounded outline-offset-0 ">
					<ChevronDown aria-hidden className="h-4 w-4" />
				</Button>
			</FieldGroup>
			{description && <Description>{description}</Description>}
			<FieldError>{errorMessage}</FieldError>
			<Popover className="w-[--trigger-width]">
				<ListBox
					items={items}
					className="max-h-[inherit] overflow-auto p-1 outline-0 [clip-path:inset(0_0_0_0_round_.75rem)]"
				>
					{children}
				</ListBox>
			</Popover>
		</AriaComboBox>
	);
}

export function ComboBoxItem(props: ListBoxItemProps) {
	return <DropdownItem {...props} />;
}

export function ComboBoxSection<T extends object>(
	props: DropdownSectionProps<T>,
) {
	return <DropdownSection {...props} />;
}
