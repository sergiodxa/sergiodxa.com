import type { loader } from "~/root";

import { useRouteLoaderData } from "@remix-run/react";

export function useUser() {
	return useRouteLoaderData<typeof loader>("root")?.user ?? null;
}
