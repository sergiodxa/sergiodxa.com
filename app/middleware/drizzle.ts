import { unstable_createSingletonMiddleware } from "remix-utils/middleware/singleton";
import database from "~/db";
import { getBindings } from "./bindings";
import { getContext } from "./context-storage";

const [drizzleMiddleware, getDBFromContext] =
	unstable_createSingletonMiddleware({
		instantiator() {
			return database(getBindings().db);
		},
	});

export function getDB() {
	let context = getContext();
	return getDBFromContext(context);
}

export { drizzleMiddleware };
