import type { SerializeFrom } from "@remix-run/cloudflare";
import type { loader } from "~/root";

import { useRouteLoaderData } from "@remix-run/react";

export function useUser() {
	let rootLoaderData = useRouteLoaderData("root") as SerializeFrom<
		typeof loader
	>;

	return rootLoaderData.user;
}
