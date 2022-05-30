import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { logger } from "~/services/logger.server";
import { createDatabaseClient } from "~/test/helpers/db";
import { createUseCase } from "~/use-case.server";

let useCase = createUseCase({
  async validate() {
    return null;
  },
  async perform(context) {
    return await context.db.user.count();
  },
});

describe("createUseCase", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await createDatabaseClient();
    await db.$connect();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test("should count the number of users", async () => {
    let result = await useCase({ db, logger });

    expect(result.status).toBe("success");

    if (useCase.isFailure(result)) {
      throw new Error("Result is not a success");
    }

    expect(result.value).toBe(1);
  });
});
