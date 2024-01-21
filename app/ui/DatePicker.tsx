import type {
	DatePickerProps as AriaDatePickerProps,
	DateValue,
	ValidationResult,
} from "react-aria-components";

import { CalendarIcon } from "lucide-react";
import { DatePicker as AriaDatePicker } from "react-aria-components";

import { Button } from "./Button";
import { Calendar } from "./Calendar";
import { DateInput } from "./DateField";
import { Dialog } from "./Dialog";
import { Description, FieldError, FieldGroup, Label } from "./Field";
import { Popover } from "./Popover";
import { composeTailwindRenderProps } from "./utils";

export interface DatePickerProps<T extends DateValue>
	extends AriaDatePickerProps<T> {
	label?: string;
	description?: string;
	errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DatePicker<T extends DateValue>({
	label,
	description,
	errorMessage,
	...props
}: DatePickerProps<T>) {
	return (
		<AriaDatePicker
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"group flex flex-col gap-1",
			)}
		>
			{label && <Label>{label}</Label>}
			<FieldGroup className="w-auto min-w-[208px]">
				<DateInput className="min-w-[150px] flex-1 px-2 py-1.5 text-sm" />
				<Button variant="icon" className="mr-1 w-6 rounded outline-offset-0">
					<CalendarIcon aria-hidden className="h-4 w-4" />
				</Button>
			</FieldGroup>
			{description && <Description>{description}</Description>}
			<FieldError>{errorMessage}</FieldError>
			<Popover>
				<Dialog>
					<Calendar />
				</Dialog>
			</Popover>
		</AriaDatePicker>
	);
}
