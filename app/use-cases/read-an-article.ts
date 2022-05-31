import { type Article } from "@prisma/client";
import { z } from "zod";
import { define } from "~/use-case";

let schema = z.object({
  articleId: z.string().nonempty().cuid(),
});

export default define<z.infer<typeof schema>, Article | null>({
  validate(input) {
    schema.parse(input);
  },

  async execute({ input: { articleId }, context }) {
    return await context.db.article.findUnique({
      where: { id: articleId },
    });
  },
});
