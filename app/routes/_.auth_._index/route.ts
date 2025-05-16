import { href, redirect } from "react-router";
import { getUser } from "~/middleware/session";

export async function loader() {
	let user = getUser();
	if (user) return redirect(href("/auth/logout"));
	return redirect(href("/auth/login"));
}
