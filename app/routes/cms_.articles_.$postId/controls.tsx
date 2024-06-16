import type { loader } from "./route";

import { useLoaderData } from "@remix-run/react";
import { parameterize } from "inflected";
import { Heading } from "react-aria-components";
import { useHydrated } from "remix-utils/use-hydrated";

import { useValue } from "~/helpers/use-value.hook";
import { TextField } from "~/ui/TextField";

export function Controls() {
	let loaderData = useLoaderData<typeof loader>();
	let isHydrated = useHydrated();

	let [title, setTitle] = useValue(
		loaderData.article.id
			? Symbol.for(`article:${loaderData.article.id}:title`)
			: Symbol.for("article:new:title"),
		loaderData.article.title,
	);

	let slug = loaderData.article.slug || parameterize(title);

	return (
		<div className="flex max-w-sm flex-grow flex-col items-stretch gap-4">
			<Heading className="text-2xl font-medium capitalize">
				Write an Article
			</Heading>

			<TextField
				name="title"
				label="Title"
				description="A title should summarize the tip and explain what
            it is about clearly."
				onChange={setTitle}
				value={title}
				maxLength={140}
			/>

			<TextField
				name="slug"
				label="Slug"
				description="Automatically generated based on the title."
				onChange={setTitle}
				value={slug}
				maxLength={140}
				isReadOnly={isHydrated}
			/>

			<TextField
				type="textarea"
				name="excerpt"
				label="Excerpt"
				maxLength={140}
				className="resize-none"
				defaultValue={loaderData.article.excerpt}
			/>
		</div>
	);
}
