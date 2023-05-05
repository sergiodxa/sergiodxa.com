export class Measurer {
	#measures = new Set<{
		name: string;
		duration: number;
	}>();

	async time<Result>(name: string, fn: () => Promise<Result>): Promise<Result> {
		let start = Date.now();
		try {
			return await fn();
		} finally {
			let duration = Date.now() - start;
			this.#measures.add({ name, duration });
		}
	}

	async toHeaders(headers = new Headers()) {
		for (let { name, duration } of this.#measures) {
			if (name.includes("/")) name = encodeURIComponent(name);
			headers.append("Server-Timing", `${name};dur=${duration}`);
		}
		return headers;
	}
}
