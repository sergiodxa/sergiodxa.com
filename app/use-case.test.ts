import type { PrismaClient } from "@prisma/client";
import { test } from "vitest";
import { z } from "zod";
import { createDatabaseClient } from "test/helpers/db";
import { createUseCase } from "~/use-case.server";
import { logger } from "./services/logger.server";

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
    if (result.status === "success") {
      expect(result.value).toBe(1);
    }
  });
});
