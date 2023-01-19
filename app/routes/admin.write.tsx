import type { ActionArgs, LoaderArgs } from "@remix-run/cloudflare";

import { redirect } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { useState } from "react";
import { notFound } from "remix-utils";
import { z } from "zod";

import { MarkdownView } from "~/components/markdown";
import { useT } from "~/helpers/use-i18n.hook";
import { parseMarkdown } from "~/md";
import { measure } from "~/utils/measure";

export let handle: SDX.Handle = { hydrate: true };

export async function loader({ request, context }: LoaderArgs) {
	return measure("routes/admin.write#loader", async () => {
		if (!(await context.services.auth.isAdmin(request))) {
			throw notFound("Not found");
		}

		await context.services.auth.authenticator.isAuthenticated(request, {
			failureRedirect: "/",
		});

		return null;
	});
}

export async function action({ request, context }: ActionArgs) {
	return measure("routes/admin.write#action", async () => {
		let formData = await request.formData();

		let { title, content } = z
			.object({ title: z.string(), content: z.string() })
			.parse({
				title: formData.get("title"),
				content: formData.get("content"),
			});

		let tutorial = await context.services.tutorials.write.perform({
			title,
			content,
			technologies: [
				{ name: "@remix-run/react", version: "1.11.0" },
				{ name: "@remix-run/node", version: "1.11.0" },
			],
		});

		return redirect(`/tutorials/${tutorial.slug}`);
	});
}

export default function Component() {
	let t = useT("translation", "admin.write");

	let [title, setTitle] = useState("Test tutorial");
	let [content, setContent] = useState("Test **content**");

	let parsedContent = parseMarkdown(content);

	return (
		<section>
			<h1>{t("title")}</h1>

			<Form method="post">
				<fieldset>
					<label htmlFor="title">{t("form.title")}</label>
					<input
						type="text"
						id="title"
						name="title"
						max={140}
						value={title}
						onChange={(e) => setTitle(e.currentTarget.value)}
					/>
				</fieldset>

				<fieldset className="-mx-96 grid grid-cols-2 gap-4">
					<label htmlFor="content" className="col-span-2">
						Content
					</label>

					<textarea
						id="content"
						name="content"
						value={content}
						onChange={(e) => setContent(e.currentTarget.value)}
					/>

					<output htmlFor="content" className="prose">
						<h1>{title}</h1>
						<MarkdownView content={parsedContent} />
					</output>
				</fieldset>

				<fieldset>
					<legend>{t("form.technologies.legend")}</legend>
				</fieldset>

				<button>{t("form.cta")}</button>
			</Form>
		</section>
	);
}
