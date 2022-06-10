import { collectedNotes } from "collected-notes";
import "dotenv/config";
import { z } from "zod";

const { CN_EMAIL, CN_TOKEN, CN_SITE } = z
  .object({
    CN_EMAIL: z.string().nonempty().email(),
    CN_TOKEN: z.string().nonempty(),
    CN_SITE: z.string().nonempty(),
  })
  .parse(process.env);

export default collectedNotes(CN_EMAIL, CN_TOKEN);
export { CN_SITE };
