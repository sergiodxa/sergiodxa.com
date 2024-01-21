import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import type { ReactNode } from "react";

import { json } from "@remix-run/cloudflare";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Button, Input, Label, TextField } from "react-aria-components";
import { useSpinDelay } from "spin-delay";
import { z } from "zod";

import { ConvertKit } from "~/services/convertkit.server";
import { cn } from "~/utils/cn";
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
		<main className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-white bg-gradient-to-b from-white to-gray-200 py-10 sm:gap-20 sm:py-20">
			<h1 className="flex flex-shrink-0 flex-col text-center text-5xl text-black sm:text-9xl">
				<small className="text-xl font-thin">
					A <em className="text-blue-600">free</em> email course to learn
				</small>
				<strong className="font-semibold tracking-wide">Remix Auth</strong>
			</h1>

			<article className="isolate -mx-5 flex aspect-video w-full max-w-md flex-col items-center justify-center gap-6 bg-white p-10 shadow-lg sm:rounded-3xl">
				<h2 className="sr-only">Subscribe</h2>

				{!actionData ? (
					<Form method="post" className="contents">
						<TextField
							name="email"
							isRequired
							className="flex w-full flex-col gap-2"
						>
							<Label className="text-lg capitalize text-black">
								Email address
							</Label>
							<Input
								type="email"
								placeholder="jane@doe.com"
								className="w-full rounded-md border-2 border-neutral-700 px-4 py-2 dark:border-neutral-200"
							/>
						</TextField>

						<Button
							type="submit"
							className="w-full rounded-md border-2 border-blue-600 bg-blue-600 px-4 py-2 tracking-wider text-blue-50 data-[disabled]:border-gray-500 data-[disabled]:bg-gray-500 data-[disabled]:text-gray-50 hover:border-blue-700 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
							isDisabled={isPending}
						>
							Subscribe for Free
						</Button>
					</Form>
				) : actionData.state == "active" ? (
					<p className="text-2xl font-medium text-green-500 sm:text-3xl">
						You're subscribed!
					</p>
				) : (
					<p className="text-2xl font-medium text-blue-500 sm:text-3xl">
						Confirm your subscription.
					</p>
				)}
			</article>

			<section className="mx-auto grid w-full max-w-screen-xl gap-5 px-5 sm:grid-cols-2">
				<Card className="col-span-1 sm:row-span-2">
					<h2 className="font-medium tracking-wide text-blue-500">
						1. Setup an Authenticator
					</h2>

					<p>
						Create an Authenticator to help you let your users access into your
						application.
					</p>

					<p>
						An Authenticator is a function that takes a request and returns a
						user. If the request is authenticated, the user will be returned.
						Otherwise, the user will be redirected to the login page.
					</p>
				</Card>

				<Card className="col-span-1">
					<h2 className="font-medium tracking-wide text-blue-500">
						2. Login with email + password
					</h2>

					<p>
						Add a login form to your site with a few lines of code. Remix Auth
						will handle the rest.
					</p>
				</Card>

				<Card className="col-span-1">
					<h2 className="font-medium tracking-wide text-blue-500">
						3. Keep the user logged-in longer
					</h2>

					<p>
						Ask the user if they want to stay logged-in for a longer period of
						time.
					</p>
				</Card>

				<Card className="col-span-1">
					<h2 className="font-medium tracking-wide text-blue-500">
						4. Take the user back where it was
					</h2>

					<p>
						Redirect the user back to the page they were on before they had to
						login.
					</p>
				</Card>

				<Card className="col-span-1 sm:row-span-2">
					<h2 className="font-medium tracking-wide text-blue-500">
						5. Split the login and signup strategies
					</h2>

					<p>
						Use different Remix Auth strategies for login and signup so you can:
					</p>

					<ul>
						<li>Ask for more information during signup.</li>
						<li>Validate the password strength.</li>
						<li>Send a confirmation email.</li>
						<li>Warn about leaked passwords.</li>
					</ul>
				</Card>

				<Card className="col-span-1">
					<h2 className="font-medium tracking-wide text-blue-500">
						6. Access with GitHub
					</h2>

					<p>Allow users to use their GitHub account to access your site.</p>
				</Card>
			</section>
		</main>
	);
}

function Card({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<article
			className={cn(
				"prose isolate w-full rounded-3xl bg-white p-10 shadow-lg",
				className,
			)}
		>
			{children}
		</article>
	);
}
