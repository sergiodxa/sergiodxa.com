import type { Handler, Updater } from "./use-editor";
import type { ReactNode } from "react";

import { CodeBracketIcon, LinkIcon } from "@heroicons/react/20/solid";
import { useMemo, useEffect, useRef } from "react";

import { getSelection } from "./get-selection";
import { Provider, useDispatch, useEditor, useElement } from "./use-editor";

namespace Button {
	type MenuItemProps = {
		children: ReactNode;
		updater: Updater;
		handler: Handler;
	};

	function MenuItem({ children, updater, handler }: MenuItemProps) {
		let dispatch = useDispatch();
		let element = useElement();
		return (
			<button
				type="button"
				role="menuitem"
				onClick={() => {
					dispatch({
						type: "update",
						payload: {
							selection: getSelection(element.current!),
							updater,
							handler,
						},
					});
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

type EditorProps = {
	value: string;
	onChange(value: string): void;
};

export function Editor({ value, onChange }: EditorProps) {
	let $textarea = useRef<HTMLTextAreaElement>(null);

	let [state, dispatch] = useEditor($textarea.current);

	let stateValue = state.value;

	// useEffect(() => {
	// 	if (stateValue === value) return;
	// 	dispatch({ type: "write", payload: { value } });
	// }, [dispatch, stateValue, value]);

	useEffect(() => {
		if (stateValue !== value) onChange(stateValue);
	}, [onChange, stateValue, value]);

	let providerValue = useMemo(() => {
		return { element: $textarea, state, dispatch };
	}, [dispatch, state]);

	return (
		<Provider value={providerValue}>
			<div>
				<div role="menubar" className="flex gap-2">
					<Button.Bold />
					<Button.Italic />
					<Button.Link />
					<Button.Code />
					<Button.Quote />
					<Button.Image />
				</div>

				<textarea
					ref={$textarea}
					value={stateValue}
					onChange={(event) => {
						let value = event.currentTarget.value;
						dispatch({ type: "write", payload: { value } });
					}}
					className="h-full w-full resize-none"
				/>
			</div>
		</Provider>
	);
}
