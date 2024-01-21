import { useT } from "~/helpers/use-i18n.hook";

export function Support() {
	let t = useT("support");

	return (
		<aside>
			<div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-0 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:px-8">
				<h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
					{t("title")}
				</h2>

				<div className="flex items-center gap-x-6 lg:flex-shrink-0">
					<a
						href="https://github.com/sponsors/sergiodxa"
						className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						{t("cta")}
					</a>
					{/* <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
						Learn more <span aria-hidden="true">→</span>
					</a> */}
				</div>
			</div>
		</aside>
	);
}
