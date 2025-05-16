import { unstable_createContextStorageMiddleware } from "remix-utils/middleware/context-storage";

export const [contextStorageMiddleware, getContext, getRequest] =
	unstable_createContextStorageMiddleware();
