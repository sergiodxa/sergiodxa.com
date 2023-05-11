import type { SelectionType } from "./get-selection";

/**
 * Get the piece of content selected from a full content stringa and
 * the selections positios
 * @param content The full content string
 * @param selection The selections positions
 * @return The sliced string
 */
export function getSelected(content: string, selection: SelectionType) {
	if (typeof content !== "string") {
		throw new TypeError("The content must be a string.");
	}

	if (typeof selection !== "object") {
		throw new TypeError("The selection must be an object.");
	}

	if (typeof selection.start !== "number") {
		throw new TypeError("The selection start value must be a number.");
	}

	if (typeof selection.end !== "number") {
		throw new TypeError("The selection end value must be a number.");
	}

	return content.slice(selection.start, selection.end);
}
