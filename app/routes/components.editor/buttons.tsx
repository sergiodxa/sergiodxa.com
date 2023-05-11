import type { Handler, Updater } from "./use-editor";
import type { ReactNode } from "react";

import { getSelection } from "./get-selection";
import { useUpdate, useElement } from "./use-editor";

export namespace Button {
	type MenuItemProps = {
		children: ReactNode;
		updater: Updater;
		handler: Handler;
	};

	export function MenuItem({ children, updater, handler }: MenuItemProps) {
		let update = useUpdate();
		let element = useElement();
		return (
			<button
				type="button"
				role="menuitem"
				className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-neutral-200"
				onClick={() => {
					let selection = getSelection(element.current!);
					update({ selection, updater, handler });
				}}
			>
				{children}
			</button>
		);
	}

	export function Bold() {
		return (
			<MenuItem
				updater={(selected) => `**${selected}**`}
				handler={({ start, end }) => ({ start: 2 + start, end: end + 2 })}
			>
				<Icon name="bold" />
			</MenuItem>
		);
	}

	export function Italic() {
		return (
			<MenuItem
				updater={(selected) => `_${selected}_`}
				handler={({ start, end }) => ({ start: 1 + start, end: end + 1 })}
			>
				<Icon name="italic" />
			</MenuItem>
		);
	}

	export function Link() {
		return (
			<MenuItem
				updater={(selected) => {
					return `[${selected}](https://)`;
				}}
				handler={({ start, end }) => ({ start: 1 + start, end: end + 10 })}
			>
				<Icon name="link" />
			</MenuItem>
		);
	}

	export function Code() {
		return (
			<MenuItem
				updater={(selected) => `\`${selected}\``}
				handler={({ start, end }) => ({ start: 1 + start, end: end + 1 })}
			>
				<Icon name="code" />
			</MenuItem>
		);
	}

	export function Quote() {
		return (
			<MenuItem
				updater={(selected) => `> ${selected}`}
				handler={({ start, end }) => ({ start: 2 + start, end: end + 2 })}
			>
				<Icon name="quote" />
			</MenuItem>
		);
	}

	export function Image() {
		return (
			<MenuItem
				updater={(selected) => `![${selected}](https://)`}
				handler={({ start, end }) => ({ start: 2 + start, end: end + 10 })}
			>
				<Icon name="image" />
			</MenuItem>
		);
	}

	function Icon({ name }: { name: string }) {
		return (
			<svg width={16} height={16}>
				<use href={`/icons?name=${name}#${name}`} />
			</svg>
		);
	}
}
