import type {
	CellProps,
	ColumnProps,
	RowProps,
	TableHeaderProps,
	TableProps,
} from "react-aria-components";

import { ArrowUp } from "lucide-react";
import {
	Cell as AriaCell,
	Column as AriaColumn,
	Row as AriaRow,
	Table as AriaTable,
	TableHeader as AriaTableHeader,
	Button,
	Collection,
	ColumnResizer,
	Group,
	ResizableTableContainer,
	composeRenderProps,
	useTableOptions,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

import { Checkbox } from "./Checkbox";
import { composeTailwindRenderProps, focusRing } from "./utils";

export function Table(props: TableProps) {
	return (
		<ResizableTableContainer className="relative max-h-[280px] w-[550px] scroll-pt-[2.281rem] overflow-auto rounded-lg border dark:border-zinc-600">
			<AriaTable {...props} className="border-separate border-spacing-0" />
		</ResizableTableContainer>
	);
}

const columnStyles = tv({
	extend: focusRing,
	base: "px-2 h-5 flex-1 flex gap-1 items-center overflow-hidden",
});

const resizerStyles = tv({
	extend: focusRing,
	base: "w-px px-[8px] translate-x-[8px] box-content py-1 h-5 bg-clip-content bg-gray-400 dark:bg-zinc-500 forced-colors:bg-[ButtonBorder] cursor-col-resize rounded resizing:bg-blue-600 forced-colors:resizing:bg-[Highlight] resizing:w-[2px] resizing:pl-[7px] -outline-offset-2",
});

export function Column(props: ColumnProps) {
	return (
		<AriaColumn
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"cursor-default text-start text-sm font-semibold text-gray-700 dark:text-zinc-300 [&:focus-within]:z-20 [&:hover]:z-20",
			)}
		>
			{composeRenderProps(
				props.children,
				(children, { allowsSorting, sortDirection }) => (
					<div className="flex items-center">
						<Group role="presentation" tabIndex={-1} className={columnStyles}>
							<span className="truncate">{children}</span>
							{allowsSorting && (
								<span
									className={`flex h-4 w-4 items-center justify-center transition ${
										sortDirection === "descending" ? "rotate-180" : ""
									}`}
								>
									{sortDirection && (
										<ArrowUp
											aria-hidden
											className="h-4 w-4 text-gray-500 dark:text-zinc-400 forced-colors:text-[ButtonText]"
										/>
									)}
								</span>
							)}
						</Group>
						{!props.width && <ColumnResizer className={resizerStyles} />}
					</div>
				),
			)}
		</AriaColumn>
	);
}

export function TableHeader<T extends object>(props: TableHeaderProps<T>) {
	let { selectionBehavior, selectionMode, allowsDragging } = useTableOptions();

	return (
		<AriaTableHeader
			{...props}
			className={twMerge(
				"sticky top-0 z-10 rounded-t-lg border-b bg-gray-100/60 backdrop-blur-md supports-[-moz-appearance:none]:bg-gray-100 dark:border-b-zinc-700 dark:bg-zinc-700/60 dark:supports-[-moz-appearance:none]:bg-zinc-700 forced-colors:bg-[Canvas]",
			)}
		>
			{/* Add extra columns for drag and drop and selection. */}
			{allowsDragging && <Column />}
			{selectionBehavior === "toggle" && (
				<AriaColumn
					width={36}
					minWidth={36}
					className="cursor-default p-2 text-start text-sm font-semibold"
				>
					{selectionMode === "multiple" && <Checkbox slot="selection" />}
				</AriaColumn>
			)}
			<Collection items={props.columns}>{props.children}</Collection>
		</AriaTableHeader>
	);
}

const rowStyles = tv({
	extend: focusRing,
	base: "group/row relative cursor-default select-none -outline-offset-2 text-gray-900 disabled:text-gray-300 dark:text-zinc-200 dark:disabled:text-zinc-600 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700/60 selected:bg-blue-100 selected:hover:bg-blue-200 dark:selected:bg-blue-700/30 dark:selected:hover:bg-blue-700/40",
});

export function Row<T extends object>({
	id,
	columns,
	children,
	...otherProps
}: RowProps<T>) {
	let { selectionBehavior, allowsDragging } = useTableOptions();

	return (
		<AriaRow id={id} {...otherProps} className={rowStyles}>
			{allowsDragging && (
				<Cell>
					<Button slot="drag">≡</Button>
				</Cell>
			)}
			{selectionBehavior === "toggle" && (
				<Cell>
					<Checkbox slot="selection" />
				</Cell>
			)}
			<Collection items={columns}>{children}</Collection>
		</AriaRow>
	);
}

const cellStyles = tv({
	extend: focusRing,
	base: "border-b dark:border-b-zinc-700 group-last/row:border-b-0 [--selected-border:theme(colors.blue.200)] dark:[--selected-border:theme(colors.blue.900)] group-selected/row:border-[--selected-border] [:has(+[data-selected])_&]:border-[--selected-border] p-2 truncate -outline-offset-2",
});

export function Cell(props: CellProps) {
	return <AriaCell {...props} className={cellStyles} />;
}
