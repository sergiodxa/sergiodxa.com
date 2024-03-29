import type { RenderableTreeNodes } from "@markdoc/markdoc";

import { renderers } from "@markdoc/markdoc";
import * as React from "react";

import { Fence } from "~/components/md/fence";

type Props = {
	content: RenderableTreeNodes;
};

export function MarkdownView({ content }: Props) {
	return <>{renderers.react(content, React, { components: { Fence } })}</>;
}
