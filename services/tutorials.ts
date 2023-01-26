import { Service } from "./service";

const PAGE_SIZE = 1000;

interface Paginated<Type> {
	items: Type[];
	total: number;
	page: {
		size: number;
		current: number;
		first: number;
		next: number | null;
		prev: number | null;
		last: number;
	};
}

export class TutorialsService extends Service {
	async list({
		page = 1,
		size = PAGE_SIZE,
	}: { page?: number; size?: number } = {}) {
		let result = await this.repos.tutorials.list();
		return this.#paginate(result, page, size);
	}

	async search({ query, page = 1 }: { query: string; page?: number }) {
		throw new Error("Not implemented");
	}

	async read(slug: string) {
		throw new Error("Not implemented");
	}

	async recommendations(slug: string) {
		throw new Error("Not implemented");
	}

	#paginate<Item>(items: Item[], page: number, size: number): Paginated<Item> {
		let total = items.length;
		let last = Math.ceil(total / size);
		let first = 1;
		let next = page < last ? page + 1 : null;
		let prev = page > first ? page - 1 : null;

		return {
			items: items.slice((page - 1) * size, page * size),
			total,
			page: { size, current: page, first, next, prev, last },
		};
	}
}
