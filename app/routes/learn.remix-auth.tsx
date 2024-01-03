import type { ActionFunctionArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { z } from "zod";

import { ConvertKit } from "~/services/convertkit.server";
import { Schemas } from "~/utils/schemas";

export async function action({ request, context }: ActionFunctionArgs) {
	throw new Error("This route is not implemented yet");

	let formData = await request.formData();

	let { email, first_name } = Schemas.formData()
		.pipe(z.object({ first_name: z.string(), email: z.string().email() }))
		.parse(formData);

	let ck = new ConvertKit(context.env.CK_API_KEY, context.env.CK_API_SECRET);
	await ck.addSubscriberToForm(context.env.CK_FORM_ID, { first_name, email });

	return json({ status: "success" as const });
}

export default function Component() {
	return (
		<>
			<header>
				<h1>Learn to Use Remix Auth</h1>
			</header>
		</>
	);
}
