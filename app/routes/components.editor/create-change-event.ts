import type { ChangeEvent } from "react";
import type { SelectionType } from "./get-selection";

export type ChangeEventType = Record<string, never>;

/**
 * Create a ChangeEvent object
 * @param selected  The selected text
 * @param selection The selection position
 * @param  markdown  The current value
 * @param native The native triggered DOM event
 * @return The ChangeEvent object
 */
export function createChangeEvent(
	selected: string,
	selection: SelectionType,
	markdown: string,
	native: ChangeEvent<HTMLTextAreaElement>,
) {
	return { selected, selection, markdown, native };
}
