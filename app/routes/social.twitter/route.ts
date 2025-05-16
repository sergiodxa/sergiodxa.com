import { redirect } from "react-router";

export async function loader() {
	return redirect("https://twitter.com/sergiodxa");
}
