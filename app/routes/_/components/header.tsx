import { useTranslation } from "react-i18next";
import { useSearchParams, useSubmit } from "react-router";
import { useUser } from "~/hooks/use-user";
import { Form } from "~/ui/Form";
import { Link } from "~/ui/Link";
import { SearchField } from "~/ui/SearchField";

export function Header() {
	let submit = useSubmit();
	let [searchParams] = useSearchParams();
	let user = useUser();
	let { t } = useTranslation("translation", { keyPrefix: "nav" });

	let navigation = [
		{ name: t("home"), to: "/" },
		{ name: t("articles"), to: "/articles" },
		{ name: t("tutorials"), to: "/tutorials" },
		{ name: t("bookmarks"), to: "/bookmarks" },
		{ name: t("glossary"), to: "/glossary" },
	];

	if (user?.role === "admin") navigation.push({ name: t("cms"), to: "/cms" });

	let query = searchParams.get("q") ?? "";

	return (
		<header className="mx-auto flex max-w-screen-xl flex-col justify-between gap-x-1 gap-y-2 px-5 py-2 md:flex-row md:items-center">
			<nav aria-label="Main" className="flex-shrink-0">
				<ul className="flex flex-wrap items-center gap-x-4">
					{navigation.map((item) => {
						return (
							<li key={item.name}>
								<Link href={item.to} prefetch="intent">
									{item.name}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			<div className="flex flex-grow flex-col items-center justify-between gap-3 md:justify-end lg:flex-row">
				{user?.isSponsor ? null : (
					<Link
						href="https://github.com/sponsors/sergiodxa"
						className="hidden lg:block"
					>
						{t("sponsor")}
					</Link>
				)}

				<Form>
					<SearchField
						label="Search"
						name="q"
						className="[&_label]:sr-only"
						placeholder="Remix, SWR, Next, Rails…"
						defaultValue={query}
						onSubmit={(q) => submit({ q })}
					/>

					<button type="submit" className="sr-only">
						Submit
					</button>
				</Form>
			</div>
		</header>
	);
}
