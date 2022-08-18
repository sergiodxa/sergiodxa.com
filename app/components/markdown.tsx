import type { RenderableTreeNodes } from "@markdoc/markdoc";

import { renderers } from "@markdoc/markdoc";
import * as React from "react";

type Props = {
	content: RenderableTreeNodes;
	components?: Record<string, React.ComponentType>;
};

export function MarkdownView({ content, components = {} }: Props) {
	return <>{renderers.react(content, React, { components })}</>;
}
