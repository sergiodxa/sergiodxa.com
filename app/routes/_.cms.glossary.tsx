import { redirect } from "@remix-run/cloudflare";

export function loader() {
	return redirect("/cms/glossary/new");
}
