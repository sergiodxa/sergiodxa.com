import { useRef } from "react";
import { FieldGroup, TextArea } from "~/ui/Field";

type EditorProps = {
	value: string;
	onChange(value: string): void;
};

export function Editor({ value, onChange }: EditorProps) {
	let $textarea = useRef<HTMLTextAreaElement>(null);

	return (
		<FieldGroup className="w-prose h-auto flex-grow flex-col items-stretch">
			<TextArea
				ref={$textarea}
				name="content"
				value={value}
				onChange={(event) => {
					onChange(event.currentTarget.value);
				}}
				className="h-auto flex-grow resize-none font-mono"
			/>
		</FieldGroup>
	);
}
