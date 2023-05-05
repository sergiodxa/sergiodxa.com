import * as semver from "semver";
import { z } from "zod";

export const SemanticVersionSchema = z
	.string()
	.refine((value) => semver.valid(value), { message: "INVALID_VERSION" });
