import LRUCache from "lru-cache";

export interface Cache {
  get<Value>(key: string): Promise<Value>;
  set<Value>(key: string, value: Value): Promise<void>;
  del(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
  run<Value>(key: string, callback: () => Promise<Value>): Promise<Value>;
}

export class InMemoryCache implements Cache {
  #cache = new LRUCache<string, unknown>({ max: 500 });

  async get<Value>(key: string) {
    let value = this.#cache.get<Value>(key);
    if (!value) throw new Error("The value was not found on the cache");
    return value;
  }

  async set<Value>(key: string, value: Value, ttl = 1000 * 60 * 60) {
    this.#cache.set(key, value, { ttl });
  }

  async del(key: string) {
    this.#cache.delete(key);
  }

  async has(key: string) {
    return this.#cache.has(key);
  }

  async clear() {
    this.#cache.clear();
  }

  async run<Value>(
    key: string,
    callback: () => Promise<Value>
  ): Promise<Value> {
    if (await this.has(key)) return (await this.get(key)) as Value;
    let value = await callback();
    await this.set(key, value);
    return value;
  }
}
