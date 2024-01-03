import type { ActionFunctionArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Button, Input, Label, TextField } from "react-aria-components";
import { useSpinDelay } from "spin-delay";
import { z } from "zod";

import { ConvertKit } from "~/services/convertkit.server";
import { Schemas } from "~/utils/schemas";

export async function action({ request, context }: ActionFunctionArgs) {
	let formData = await request.formData();

	let { email } = Schemas.formData()
		.pipe(z.object({ email: z.string().email() }))
		.parse(formData);

	let ck = new ConvertKit(context.env.CK_API_KEY, context.env.CK_API_SECRET);
	let { subscription } = await ck.addSubscriberToForm(context.env.CK_FORM_ID, {
		email,
	});

	return json({ status: "success" as const, state: subscription.state });
}

export default function Component() {
	let navigation = useNavigation();

	let actionData = useActionData<typeof action>();

	let isPending = useSpinDelay(navigation.state !== "idle", {
		delay: 50,
		minDuration: 300,
	});

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-gray-50 dark:bg-neutral-950">
			<h1 className="text-9xl font-black text-neutral-900 dark:text-white">
				<small className="text-5xl font-bold text-neutral-700 dark:text-neutral-200">
					A <em>free</em> email course to learn
				</small>
				<br />
				<strong>Remix Auth</strong>
			</h1>

			<Form
				method="post"
				className="mx-auto flex w-full max-w-xs flex-col gap-6"
			>
				<TextField
					name="email"
					isRequired
					className="flex w-full flex-col gap-1"
				>
					<Label className="text-sm text-neutral-500">Email address</Label>
					<Input
						type="email"
						placeholder="jane@doe.com"
						className="w-full rounded-md border-2 border-neutral-700 px-4 py-2 dark:border-neutral-200"
					/>
				</TextField>

				<Button
					type="submit"
					className="w-full rounded-md border-2 border-blue-600 bg-blue-600 px-4 py-2 text-blue-50 hover:border-blue-700 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 data-[disabled]:border-gray-500 data-[disabled]:bg-gray-500 data-[disabled]:text-gray-50"
					isDisabled={isPending}
				>
					Subscribe for Free
				</Button>

				{!actionData && <div className="h-6" />}

				{actionData?.status === "success" && actionData.state === "active" && (
					<p className="font-semibold text-green-500">You're subscribed</p>
				)}

				{actionData?.status === "success" &&
					actionData.state === "inactive" && (
						<p className="font-semibold text-blue-500">
							Confirm your subscription
						</p>
					)}
			</Form>
		</main>
	);
}
