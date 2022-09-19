import type { RenderableTreeNode } from "@markdoc/markdoc";

export function generateID(
	children: RenderableTreeNode[],
	attributes: Record<string, any>
) {
	if (attributes.id && typeof attributes.id === "string") {
		return attributes.id;
	}

	return children
		.filter((child) => typeof child === "string")
		.join(" ")
		.replace(/[?]/g, "")
		.replace(/\s+/g, "-")
		.toLowerCase();
}
