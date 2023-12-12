export class Cache {
	constructor(protected kv: KVNamespace) {}

	get(
		key: string,
		withMetadata: true,
	): Promise<KVNamespaceGetWithMetadataResult<string, unknown>>;
	get(key: string, withMetadata?: false): Promise<string | null>;
	get(key: string, withMetadata?: boolean) {
		if (withMetadata) return this.kv.getWithMetadata(key, "text");
		return this.kv.get(key, "text");
	}

	async has(key: string) {
		return (await this.get(key)) !== null;
	}

	set(key: string, value: string, options?: KVNamespacePutOptions) {
		return this.kv.put(key, value, options);
	}

	delete(key: string) {
		return this.kv.delete(key);
	}

	list(options?: KVNamespaceListOptions) {
		return this.kv.list(options);
	}

	async clear(prefix: string) {
		let { keys, list_complete: isCompleted } = await this.list({
			prefix,
			limit: 1000,
		});

		while (!isCompleted) {
			let result = await this.list({
				prefix,
				limit: 1000,
				cursor: keys[keys.length - 1].name,
			});
			keys = keys.concat(result.keys);
			isCompleted = result.list_complete;
		}

		await Promise.all(keys.map(({ name }) => this.delete(name)));
	}
}
