import type { loader } from "./route";

import { useLoaderData } from "@remix-run/react";
import {
	GridList,
	GridListItem,
	Button,
	Checkbox,
} from "react-aria-components";

export function CacheKeyList() {
	let { keys } = useLoaderData<typeof loader>();

	return (
		<GridList
			aria-label="Cache Keys"
			selectionMode="multiple"
			className="flex flex-col gap-0.5 rounded-md border border-neutral-300 p-1 data-[focus-visible]:outline-2 data-[focus-visible]:outline-blue-600"
		>
			{keys.map((key) => {
				return (
					<GridListItem
						key={key}
						textValue={key}
						className="data-[selected]:bg-grey-100 flex items-center gap-2.5 rounded-md p-1 pl-2 data-[selected]:text-blue-600"
					>
						<StyledCheckbox value={key} />
						{key}
					</GridListItem>
				);
			})}
		</GridList>
	);
}

function StyledCheckbox({ value }: { value: string }) {
	return (
		<Checkbox
			slot="selection"
			className="flex items-center"
			name="key"
			value={value}
		>
			{({ isSelected }) => {
				return (
					<div className="h-5 w-5 rounded border-2 border-neutral-300">
						{isSelected && (
							<svg viewBox="0 0 18 18" aria-hidden="true" className="h-4 w-4">
								<polyline points="1 9 7 14 15 4" />
							</svg>
						)}
					</div>
				);
			}}
		</Checkbox>
	);
}
