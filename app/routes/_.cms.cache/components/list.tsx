import { GridList, GridListItem } from "~/ui/GridList";

interface CacheKeyListProps {
	keys: string[];
}

export function CacheKeyList({ keys }: CacheKeyListProps) {
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
