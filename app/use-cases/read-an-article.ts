import { type Article } from "@prisma/client";
import { z } from "zod";
import { define } from "~/use-case";

let schema = z.object({
  slug: z.string().nonempty(),
});

export default define<z.infer<typeof schema>, Article | null>({
  validate(input) {
    schema.parse(input);
  },

  async execute({ input: { slug }, context }) {
    return await context.db.article.findUnique({
      where: { slug },
    });
  },
});
