import type { SelectionType } from "./get-selection";

/**
 * Set the content selection range in the given field input
 * @param selection The selections positions
 * @param field The DOMNode field
 */
export function setSelectionRange(
	field: HTMLTextAreaElement,
	selection: SelectionType
) {
	field.setSelectionRange(selection.start, selection.end, "forward");
	return null;
}
