import type { Handler, Updater } from "./use-editor";
import type { ReactNode } from "react";

import {
	BoldIcon,
	ItalicIcon,
	LinkIcon,
	CodeIcon,
	QuoteIcon,
	ImageIcon,
	HeadingIcon,
} from "lucide-react";

import { useT } from "~/helpers/use-i18n.hook";

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
		let t = useT("translation", "editor");
		return (
			<MenuItem
				updater={(selected) => `**${selected}**`}
				handler={({ start, end }) => ({ start: 2 + start, end: end + 2 })}
			>
				<BoldIcon className="h-4 w-4" aria-hidden />
				<span className="sr-only">{t("button.bold")}</span>
			</MenuItem>
		);
	}

	export function Italic() {
		let t = useT("translation", "editor");
		return (
			<MenuItem
				updater={(selected) => `_${selected}_`}
				handler={({ start, end }) => ({ start: 1 + start, end: end + 1 })}
			>
				<ItalicIcon className="h-4 w-4" aria-hidden />
				<span className="sr-only">{t("button.italic")}</span>
			</MenuItem>
		);
	}

	export function Link() {
		let t = useT("translation", "editor");
		return (
			<MenuItem
				updater={(selected) => {
					return `[${selected}](https://)`;
				}}
				handler={({ start, end }) => ({ start: 1 + start, end: end + 10 })}
			>
				<LinkIcon className="h-4 w-4" aria-hidden />
				<span className="sr-only">{t("button.link")}</span>
			</MenuItem>
		);
	}

	export function Code() {
		let t = useT("translation", "editor");
		return (
			<MenuItem
				updater={(selected) => `\`${selected}\``}
				handler={({ start, end }) => ({ start: 1 + start, end: end + 1 })}
			>
				<CodeIcon className="h-4 w-4" aria-hidden />
				<span className="sr-only">{t("button.code")}</span>
			</MenuItem>
		);
	}

	export function Quote() {
		let t = useT("translation", "editor");
		return (
			<MenuItem
				updater={(selected) => `> ${selected}`}
				handler={({ start, end }) => ({ start: 2 + start, end: end + 2 })}
			>
				<QuoteIcon className="h-4 w-4" aria-hidden />
				<span className="sr-only">{t("button.quote")}</span>
			</MenuItem>
		);
	}

	export function Image() {
		let t = useT("translation", "editor");
		return (
			<MenuItem
				updater={(selected) => `![${selected}](https://)`}
				handler={({ start, end }) => ({ start: 2 + start, end: end + 10 })}
			>
				<ImageIcon className="h-4 w-4" aria-hidden />
				<span className="sr-only">{t("button.image")}</span>
			</MenuItem>
		);
	}

	export function Heading() {
		let t = useT("translation", "editor");
		return (
			<MenuItem
				updater={(selected) => `## ${selected}`}
				handler={({ start, end }) => ({ start, end: end + 3 })}
			>
				<HeadingIcon className="h-4 w-4" aria-hidden />
				<span className="sr-only">{t("button.heading")}</span>
			</MenuItem>
		);
	}
}
