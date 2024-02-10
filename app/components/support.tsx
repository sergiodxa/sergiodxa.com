import { useT } from "~/helpers/use-i18n.hook";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";

export function Support() {
	let t = useT("support");

	return (
		<aside>
			<div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-0 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:px-8">
				<h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
					{t("title")}
				</h2>

				<Form action="/sponsor">
					<Button type="submit" variant="primary">
						{t("cta")}
					</Button>
				</Form>
			</div>
		</aside>
	);
}
