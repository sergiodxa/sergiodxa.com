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
		loaderData.tutorial.id
			? Symbol.for(`tutorial:${loaderData.tutorial.id}:title`)
			: Symbol.for("tutorial:new:title"),
		loaderData.tutorial.title,
	);

	let slug = loaderData.tutorial.slug || parameterize(title);

	return (
		<div className="flex max-w-sm flex-grow flex-col items-stretch gap-4">
			<Heading className="text-2xl font-medium capitalize">
				Write a Tutorial
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
				name="tags"
				label="Tags"
				description="A blank space separated list of tags to help suggest similar tutorials."
				defaultValue={loaderData.tutorial.tags?.join(" ")}
			/>

			<TextField
				type="textarea"
				name="excerpt"
				label="Excerpt"
				maxLength={140}
				className="resize-none"
				defaultValue={loaderData.tutorial.excerpt}
			/>
		</div>
	);
}
