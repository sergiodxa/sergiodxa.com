import LRU from "lru-cache";

export class RateLimit {
  private cache: LRU<string, number> = new LRU<string, number>({
    max: this.uniqueTokens || 500,
    maxAge: this.interval || 60000,
  });

  constructor(private uniqueTokens = 500, private interval = 6000) {}

  public async check(token: string, limit: number) {
    console.log({ token, limit });
    let currentUsage: number = Number(this.cache.get(token) ?? 0);
    console.log({ currentUsage }, currentUsage + 1);
    this.cache.set(token, currentUsage + 1);

    let isRateLimited = currentUsage >= limit;

    console.log({ isRateLimited });

    if (!isRateLimited) return;

    throw new Response(null, {
      status: 429,
      headers: {
        "Retry-After": this.interval.toString(),
        "X-RateLimit-Limit": limit.toString(),
      },
    });
  }
}
