import { useMemo, useEffect, useRef } from "react";

import { Button } from "./buttons";
import { Provider, useEditor } from "./use-editor";

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
					className="h-full w-full resize-none font-mono"
				/>
			</div>
		</Provider>
	);
}
