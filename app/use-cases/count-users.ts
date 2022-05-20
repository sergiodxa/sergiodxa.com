import { createUseCase } from "~/use-case.server";

export default createUseCase({
  async validate() {
    return null;
  },

  async perform(context) {
    let count = await context.db.user.count();
    context.logger.info("Count users", { count });
    return count;
  },
});
