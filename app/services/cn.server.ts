import { collectedNotes } from "collected-notes";
import { env } from "~/utils/environment";

export let cn = collectedNotes(env("CN_EMAIL"), env("CN_TOKEN"));

export let site = env("CN_SITE");
