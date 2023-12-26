export namespace Cache {
	type CacheKey = string | { cacheKey: string } | { cacheKey(): string };

	interface StoreWriteOptions {
		ttl?: number;
	}

	abstract class Store {
		abstract read(key: CacheKey): Promise<string | null>;
		abstract write(
			key: CacheKey,
			value: string,
			options?: StoreWriteOptions,
		): Promise<void>;
		abstract delete(key: CacheKey): Promise<void>;
		abstract exists(key: CacheKey): Promise<boolean>;
		abstract fetch(
			key: CacheKey,
			fn: () => Promise<string>,
			options?: StoreWriteOptions,
		): Promise<string>;

		protected getKey(key: CacheKey): string {
			if (typeof key === "string") return key;
			if (typeof key.cacheKey === "string") return key.cacheKey;
			return key.cacheKey();
		}
	}

	interface KVStoreWriteOptions extends StoreWriteOptions {
		metadata?: KVNamespacePutOptions["metadata"];
	}

	/**
	 * A store that uses Cloudflare's KV store.
	 */
	export class KVStore extends Store {
		constructor(
			private readonly kv: KVNamespace,
			private readonly waitUntil: (promise: Promise<unknown>) => void,
		) {
			super();
		}

		async read(key: CacheKey): Promise<string | null> {
			return this.kv.get(this.getKey(key), "text");
		}

		async write(
			key: CacheKey,
			value: string,
			{ ttl, metadata }: KVStoreWriteOptions = {},
		): Promise<void> {
			this.waitUntil(
				this.kv.put(this.getKey(key), value, {
					expirationTtl: ttl,
					metadata,
				}),
			);
		}

		async delete(key: CacheKey): Promise<void> {
			await this.kv.delete(this.getKey(key));
		}

		async exists(key: CacheKey): Promise<boolean> {
			let result = await this.read(key);
			return result !== null;
		}

		async fetch(
			key: CacheKey,
			fn: () => Promise<string>,
			options?: KVStoreWriteOptions,
		): Promise<string> {
			let cached = await this.read(key);
			if (cached !== null) return cached;
			let value = await fn();
			await this.write(key, value, options);
			return value;
		}
	}
}
