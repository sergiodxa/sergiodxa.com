import { z } from "zod";
import { createUseCase } from "~/use-case.server";

let schema = z.object({
  page: z.number().default(1),
  count: z.number().default(10),
});

export default createUseCase({
  async validate(data) {
    return schema.parse({
      page: data.get("page"),
      count: data.get("count"),
    });
  },

  async perform({ db }, { page = 1, count = 10 }) {
    return await db.article.findMany({
      where: { status: "published" },
      select: { id: true, title: true, slug: true },
      orderBy: { createdAt: "desc" },
      skip: page * count,
    });
  },
});
