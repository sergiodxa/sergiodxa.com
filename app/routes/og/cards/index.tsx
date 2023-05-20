import type { ReactNode } from "react";

/* eslint-disable react/no-unknown-property */
declare module "react" {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface HTMLAttributes<T> {
		tw?: string;
	}
}

type Props = {
	avatarURL: URL;
	locale: string;
	title: ReactNode;
	description?: ReactNode;
};

export function Card({ avatarURL, locale, title, description }: Props) {
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
			<h1 tw="flex flex-col font-bold text-5xl">{title}</h1>
			{description && <p>{description}</p>}
		</div>
	);
}
