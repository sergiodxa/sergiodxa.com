import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

export function Navigation() {
	let { t } = useTranslation("translation", { keyPrefix: "cms.layout.nav" });

	let navigation = [
		{ name: t("items.dashboard"), to: "" },
		{ name: t("items.articles"), to: "articles" },
		{ name: t("items.likes"), to: "likes" },
		{ name: t("items.tutorials"), to: "tutorials" },
		{ name: t("items.glossary"), to: "glossary" },
		{ name: t("items.cache"), to: "cache" },
		{ name: t("items.redirects"), to: "redirects" },
	] as const;

	return (
		<nav className="rounded-lg bg-blue-600" aria-label={t("label")}>
			<div className="flex w-full flex-col justify-between gap-4 border-b border-blue-500 py-6 md:flex-row md:items-center md:gap-10 lg:border-none">
				<div className="flex flex-wrap items-center gap-x-6 gap-y-4 px-6">
					{navigation.map((link) => (
						<NavLink
							key={link.name}
							to={link.to}
							className="text-base font-medium text-white no-underline visited:text-white hover:text-blue-50"
						>
							{link.name}
						</NavLink>
					))}
				</div>
			</div>
		</nav>
	);
}
