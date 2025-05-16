import { unstable_createSingletonMiddleware } from "remix-utils/middleware/singleton";
import { Cache } from "~/modules/cache.server";
import { getBindings } from "./bindings";
import { getContext } from "./context-storage";

const [cacheMiddleware, getCacheFromContext] =
	unstable_createSingletonMiddleware({
		instantiator: () => {
			return new Cache.KVStore(getBindings().kv.cache, getBindings().waitUntil);
		},
	});

export function getCache() {
	let context = getContext();
	return getCacheFromContext(context);
}

export { cacheMiddleware };
