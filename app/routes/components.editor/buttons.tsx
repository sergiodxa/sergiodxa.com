import {
	BoldIcon,
	CodeIcon,
	HeadingIcon,
	ImageIcon,
	ItalicIcon,
	LinkIcon,
	QuoteIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button as UIButton } from "~/ui/Button";
import { getSelection } from "./get-selection";
import type { Handler, Updater } from "./use-editor";
import { useElement, useUpdate } from "./use-editor";

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
			<UIButton
				type="button"
				variant="secondary"
				onPress={() => {
					if (!element.current) return;
					let selection = getSelection(element.current);
					update({ selection, updater, handler });
				}}
			>
				{children}
			</UIButton>
		);
	}

	export function Bold() {
		let { t } = useTranslation("translation", { keyPrefix: "editor" });
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
		let { t } = useTranslation("translation", { keyPrefix: "editor" });
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
		let { t } = useTranslation("translation", { keyPrefix: "editor" });
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
		let { t } = useTranslation("translation", { keyPrefix: "editor" });
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
		let { t } = useTranslation("translation", { keyPrefix: "editor" });
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
		let { t } = useTranslation("translation", { keyPrefix: "editor" });
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
		let { t } = useTranslation("translation", { keyPrefix: "editor" });
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
