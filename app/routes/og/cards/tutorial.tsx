import type { TFunction } from "i18next";

/* eslint-disable react/no-unknown-property */
declare module "react" {
	interface HTMLAttributes<T> {
		tw?: string;
	}
}

type Props = { avatarURL: URL; locale: string; t: TFunction; title: string };

export function Tutorial({ avatarURL, locale, t, title }: Props) {
	return (
		<div
			lang={locale}
			tw="w-screen h-screen flex items-center justify-center relative"
			style={{ fontFamily: "Inter" }}
		>
			<img
				src={avatarURL.toString()}
				width={128}
				height={128}
				alt=""
				tw="absolute left-4 top-4"
			/>
			<h1 tw="flex flex-col font-bold text-5xl">
				<small tw="block text-2xl text-blue-500">
					{t("og.tutorial.eyebrown")}
				</small>
				{title}
			</h1>
		</div>
	);
}
