export type SelectionType = { start: number; end: number };

/**
 * Get the element selection start and end values
 * @param field The DOM node element
 * @return The selection start and end
 */
export function getSelection(field: HTMLTextAreaElement) {
	if (!(field instanceof HTMLTextAreaElement)) {
		throw new TypeError("The field must be an HTMLTextAreaElement.");
	}

	return {
		start: field.selectionStart,
		end: field.selectionEnd,
	} as SelectionType;
}
