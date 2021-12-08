import { collectedNotes } from "collected-notes";
import { requireEnv } from "~/utils/environment";

export let cn = collectedNotes(requireEnv("CN_EMAIL"), requireEnv("CN_TOKEN"));

export let site = requireEnv("CN_SITE");
