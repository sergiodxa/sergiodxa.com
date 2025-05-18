import { unstable_createRollingCookieMiddleware } from "remix-utils/middleware/rolling-cookie";
import { cookie } from "./session";

export const [rollingCookieMiddleware] = unstable_createRollingCookieMiddleware(
	{ cookie },
);
