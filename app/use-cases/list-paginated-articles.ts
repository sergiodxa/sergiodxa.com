import { z } from "zod";
import { articleModel } from "~/models/article.server";
import { createUseCase } from "~/use-case.server";

let schema = z.object({
  page: z.number().default(1),
  count: z.number().default(10),
});

export default createUseCase<
  z.infer<typeof schema>,
  z.infer<typeof articleModel>[]
>({
  async validate(data) {
    return schema.parse({
      page: data.get("page") ?? 1,
      count: data.get("count") ?? 10,
    });
  },

  async perform({ db }, { page, count }) {
    let result = await db.article.findMany({
      where: { status: "published" },
      select: { id: true, title: true, slug: true },
      orderBy: { createdAt: "desc" },
      skip: page * count,
      take: count,
    });

    return result.map((item) => {
      return articleModel.parse(item);
    });
  },
});
