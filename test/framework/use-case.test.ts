import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, expect, test } from "vitest";
import { createDatabaseClient } from "~/helpers/db";
import { logger } from "~/services/logger.server";
import { define } from "~/use-case";
import { isFailure } from "~/use-case/result";

let useCase = define<null, number>({
  async validate() {
    return null;
  },
  async execute({ context }) {
    return await context.db.user.count();
  },
});

let db: PrismaClient;

beforeAll(async () => {
  db = await createDatabaseClient();
  await db.$connect();
});

afterAll(async () => {
  await db.$disconnect();
});

test("should count the number of users", async () => {
  let result = await useCase(null, { db, logger });

  expect(result.status).toBe("success");

  if (isFailure(result)) {
    throw new Error("Result is not a success");
  }

  expect(result.value).toBe(1);
});
