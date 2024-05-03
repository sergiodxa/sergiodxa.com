import type {
	MenuProps as AriaMenuProps,
	MenuItemProps,
	SeparatorProps,
} from "react-aria-components";
import type { DropdownSectionProps } from "./ListBox";
import type { PopoverProps } from "./Popover";

import { Check } from "lucide-react";
import {
	Menu as AriaMenu,
	MenuItem as AriaMenuItem,
	Separator,
	composeRenderProps,
} from "react-aria-components";

import { DropdownSection, dropdownItemStyles } from "./ListBox";
import { Popover } from "./Popover";

interface MenuProps<T> extends AriaMenuProps<T> {
	placement?: PopoverProps["placement"];
}

export function Menu<T extends object>(props: MenuProps<T>) {
	return (
		<Popover placement={props.placement} className="min-w-[150px]">
			<AriaMenu
				{...props}
				className="max-h-[inherit] overflow-auto p-1 outline outline-0 [clip-path:inset(0_0_0_0_round_.75rem)]"
			/>
		</Popover>
	);
}

export function MenuItem(props: MenuItemProps) {
	return (
		<AriaMenuItem {...props} className={dropdownItemStyles}>
			{composeRenderProps(
				props.children,
				(children, { selectionMode, isSelected }) => (
					<>
						{selectionMode !== "none" && (
							<span className="flex w-4 items-center">
								{isSelected && <Check aria-hidden className="h-4 w-4" />}
							</span>
						)}
						<span className="flex flex-1 items-center gap-2 truncate font-normal group-selected:font-semibold">
							{children}
						</span>
					</>
				),
			)}
		</AriaMenuItem>
	);
}

export function MenuSeparator(props: SeparatorProps) {
	return (
		<Separator
			{...props}
			className="mx-3 my-1 border-b border-gray-300 dark:border-zinc-700"
		/>
	);
}

export function MenuSection<T extends object>(props: DropdownSectionProps<T>) {
	return <DropdownSection {...props} />;
}
