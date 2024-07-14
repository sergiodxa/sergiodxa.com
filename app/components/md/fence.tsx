// import "prismjs/components/prism-bash";
// import "prismjs/components/prism-cshtml";
// import "prismjs/components/prism-css";
// import "prismjs/components/prism-diff";
// import "prismjs/components/prism-graphql";
// import "prismjs/components/prism-http";
// import "prismjs/components/prism-javascript";
// import "prismjs/components/prism-json";
// import "prismjs/components/prism-jsx";
// import "prismjs/components/prism-markdown";
// import "prismjs/components/prism-ruby";
// import "prismjs/components/prism-sql";
// import "prismjs/components/prism-stylus";
// import "prismjs/components/prism-toml";
// import "prismjs/components/prism-typescript";
// import "prismjs/components/prism-yaml";
// import "prismjs/plugins/line-numbers/prism-line-numbers";

import Icon from "~/components/icon";

type FenceProps = {
	content: string;
	language: string;
	path?: string;
};

export function Fence({ content, language, path, ...props }: FenceProps) {
	console.log("component", content, language, path, props);
	return (
		<pre className={`language-${language}`}>
			{path && (
				<header className="flex items-center gap-1 pb-1.5">
					<Icon icon="document" className="h-4 w-4" aria-hidden />
					<span className="text-xs leading-none">{path}</span>
				</header>
			)}
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: Required to pass highlighted code here */}
			<code dangerouslySetInnerHTML={{ __html: content }} />
		</pre>
	);
}

type FileNode = {
	type: "file" | "directory";
	name: string;
	children?: FileNode[];
};

function FileTree({ content }: { content: string }) {
	let tree = JSON.parse(content) as FileNode[];

	return (
		<ul className="file-tree">
			{tree.map((node) => (
				<FileNode key={node.name} node={node} />
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
				{node.children?.map((child) => (
					<FileNode key={child.name} node={child} />
				))}
			</ul>
		</li>
	);
}
