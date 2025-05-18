import type { Timing } from "@edgefirst-dev/server-timing";
import { unstable_createServerTimingMiddleware } from "remix-utils/middleware/server-timing";
import { getContext } from "./context-storage";

const [serverTimingMiddleware, getTimingCollectorFromContext] =
	unstable_createServerTimingMiddleware();

export { serverTimingMiddleware };

export function getTimingCollector() {
	return getTimingCollectorFromContext(getContext());
}

export function measure<T>(
	name: string,
	description: string,
	fn: Timing.MeasureFunction<T>,
) {
	return getTimingCollector().measure(name, description, fn);
}
