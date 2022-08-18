import { redirect, type LoaderArgs } from "@remix-run/cloudflare";
import invariant from "tiny-invariant";

const PROJECTS = {
	"remix-auth": "https://github.com/sergiodxa/remix-auth",
	"remix-i18next": "https://github.com/sergiodxa/remix-i18next",
	"remix-utils": "https://github.com/sergiodxa/remix-utils",
};

export async function loader({ params }: LoaderArgs) {
	try {
		let { project } = params;

		invariant(project, "The project is required");
		invariant(
			Object.keys(PROJECTS).includes(project),
			`The project "${project}" is not supported`
		);

		return redirect(PROJECTS[project as keyof typeof PROJECTS]);
	} catch (error) {
		return redirect("/");
	}
}
