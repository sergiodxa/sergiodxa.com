import { z } from "zod";
import { createUseCase } from "~/use-case.server";

let schema = z.object({ articleId: z.string().cuid() });

export default createUseCase<z.infer<typeof schema>, void>({
  async validate(data) {
    return schema.parse({
      articleId: data.get("articleId"),
    });
  },

  async perform({ db }, { articleId }) {
    await db.article.update({
      where: { id: articleId },
      data: { status: "published" },
    });
  },
});
