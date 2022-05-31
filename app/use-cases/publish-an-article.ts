import { z } from "zod";
import { define } from "~/use-case";

let schema = z.object({ articleId: z.string().cuid() });

export default define<z.infer<typeof schema>, void>({
  async validate({ articleId }) {
    return schema.parse({ articleId });
  },

  async execute({ input: { articleId }, context }) {
    await context.db.article.update({
      where: { id: articleId },
      data: { status: "published" },
    });
  },
});
