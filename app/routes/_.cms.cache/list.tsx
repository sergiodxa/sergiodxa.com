import type { loader } from "./route";

import { useLoaderData } from "@remix-run/react";

import { GridList, GridListItem } from "~/ui/GridList";

export function CacheKeyList() {
	let { keys } = useLoaderData<typeof loader>();

	return (
		<GridList
			aria-label="Cache Keys"
			selectionMode="multiple"
			selectionBehavior="toggle"
			items={keys.map((key) => ({ value: key }))}
		>
			{(item) => {
				return (
					<GridListItem
						key={item.value}
						id={item.value}
						textValue={item.value}
						name="key"
					>
						{item.value}
					</GridListItem>
				);
			}}
		</GridList>
	);
}
