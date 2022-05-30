import { z } from "zod";
import { createQuery } from "~/use-case.server";

let schema = z.object({
  page: z.number().default(1),
  count: z.number().default(10),
});

export default createQuery({
  async validate(data) {
    return schema.parse({
      page: data.get("page") ?? 1,
      count: data.get("count") ?? 10,
    });
  },

  async perform({ db }, { page, count }) {
    return await db.article.findMany({
      where: { status: "published" },
      select: { id: true, title: true, slug: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * count,
      take: count,
    });
  },
});
