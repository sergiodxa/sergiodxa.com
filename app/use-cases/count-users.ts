import { define, type EmptyInput } from "~/use-case";

export default define<EmptyInput, number>({
  async validate() {
    return null;
  },

  async execute({ context }) {
    let count = await context.db.user.count();
    context.logger.info("Count users", { count });
    return count;
  },
});
