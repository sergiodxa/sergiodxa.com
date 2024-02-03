import Prism from "prismjs";

import "prismjs/components/prism-bash";
import "prismjs/components/prism-cshtml";
import "prismjs/components/prism-css";
import "prismjs/components/prism-diff";
import "prismjs/components/prism-graphql";
import "prismjs/components/prism-http";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-stylus";
import "prismjs/components/prism-toml";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-yaml";
import "prismjs/plugins/line-numbers/prism-line-numbers";
import Icon from "../icon";
import { Heading } from "react-aria-components";

type FenceProps = {
	children: string;
	language: string;
	path?: string;
};

export function Fence({ children, language, path }: FenceProps) {
	if (language === "tsx") language = "ts";
	if (language === "dotenv") language = "plain";
	if (language === "erb") language = "html";
	if (language === "mdx") language = "md";
	if (!language) language = "plain";

	if (language === "file-tree") {
		return <FileTree content={children} />;
	}

	let content: string = "";
	try {
		content = Prism.highlight(children, Prism.languages[language], language);
	} catch (error) {
		if (error instanceof Error && error.message.includes("has no grammar")) {
			try {
				content = Prism.highlight(children, Prism.languages.plain, "plain");
			} catch {
				// ignore any error here
			}
		}

		// ignore other errors
	}

	return (
		<pre className={`language-${language}`}>
			{path && (
				<header className="flex items-center gap-1 pb-1.5">
					<Icon icon="document" className="h-4 w-4" aria-hidden />
					<span className="text-xs leading-none">{path}</span>
				</header>
			)}
			<code dangerouslySetInnerHTML={{ __html: content }} />
		</pre>
	);
}

export const fence = {
	render: "Fence",
	attributes: { language: { type: String }, path: { type: String } },
};

type FileNode = {
	type: "file" | "directory";
	name: string;
	children?: FileNode[];
};

function FileTree({ content }: { content: string }) {
	let tree = JSON.parse(content) as FileNode[];

	return (
		<ul className="file-tree">
			{tree.map((node, index) => (
				<FileNode key={index} node={node} />
			))}
		</ul>
	);
}

function FileNode({ node }: { node: FileNode }) {
	if (node.type === "file") return <li className="file">{node.name}</li>;

	return (
		<li className="directory">
			<span className="directory-name">{node.name}</span>
			<ul className="directory-contents">
				{node.children?.map((child, index) => (
					<FileNode key={index} node={child} />
				))}
			</ul>
		</li>
	);
}
