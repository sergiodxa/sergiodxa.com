import type { Handler, Updater } from "./use-editor";
import type { ReactNode } from "react";

import { CodeBracketIcon, LinkIcon } from "@heroicons/react/20/solid";

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
				Bold
			</MenuItem>
		);
	}

	export function Italic() {
		return (
			<MenuItem
				updater={(selected) => `_${selected}_`}
				handler={({ start, end }) => ({ start: 1 + start, end: end + 1 })}
			>
				Italic
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
				<LinkIcon aria-hidden className="h-5 w-5" />
			</MenuItem>
		);
	}

	export function Code() {
		return (
			<MenuItem
				updater={(selected) => `\`${selected}\``}
				handler={({ start, end }) => ({ start: 1 + start, end: end + 1 })}
			>
				<CodeBracketIcon aria-hidden className="h-5 w-5" />
			</MenuItem>
		);
	}

	export function Quote() {
		return (
			<MenuItem
				updater={(selected) => `> ${selected}`}
				handler={({ start, end }) => ({ start: 2 + start, end: end + 2 })}
			>
				Quote
			</MenuItem>
		);
	}

	export function Image() {
		return (
			<MenuItem
				updater={(selected) => `![${selected}](https://)`}
				handler={({ start, end }) => ({ start: 2 + start, end: end + 10 })}
			>
				Image
			</MenuItem>
		);
	}
}
