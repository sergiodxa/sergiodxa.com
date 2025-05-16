import type { Route } from "./+types/route";
import avatar from "./avatar.png";

export function loader({ request }: Route.LoaderArgs) {
	let url = new URL(avatar, request.url);
	return fetch(url);
}
