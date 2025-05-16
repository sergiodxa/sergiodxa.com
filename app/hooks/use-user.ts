import { useRouteLoaderData } from "react-router";
import type { loader } from "~/root";

export function useUser() {
	return useRouteLoaderData<typeof loader>("root")?.user ?? null;
}
