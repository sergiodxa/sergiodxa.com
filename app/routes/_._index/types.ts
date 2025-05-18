import type { UUID } from "~/utils/uuid";

export interface FeedItem {
	id: UUID;
	type: string;
	payload: { title: string; link: string; createdAt: Date };
}
