import type { SelectionType } from "./get-selection";

/**
 * Update the selected content with the updated content in the given full content
 * @param content The full content string
 * @param selection The selections positions
 * @param updated The update slice of content
 * @return The final updated content string
 */
export function updateContent(
	content: string,
	selection: SelectionType,
	updated: string
) {
	return (
		content.slice(0, selection.start) + updated + content.slice(selection.end)
	);
}
