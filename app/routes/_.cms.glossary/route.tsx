import { redirect } from "react-router";

export function loader() {
	return redirect("/cms/glossary/new");
}
