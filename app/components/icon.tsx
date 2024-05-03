import { type SVGProps } from "react";

import href from "./icon.svg";
export { href };

export default function Icon({
	icon,
	...props
}: SVGProps<SVGSVGElement> & { icon: IconName }) {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: It can be a prop
		<svg {...props}>
			<use href={`${href}#${icon}`} />
		</svg>
	);
}

export const iconNames = [
	"book",
	"bookmark",
	"document",
	"markdown",
	"pencil",
] as const;
export type IconName = (typeof iconNames)[number];
