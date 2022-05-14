import { createUseCase } from "~/use-case.server";

export default createUseCase({
  schema: (z) => z.object({}),

  async perform(context) {
    let count = await context.db.user.count();
    context.logger.info("Count users", { count });
    return count;
  },
});
