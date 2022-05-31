import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, test } from "vitest";
import { createDatabaseClient } from "~/helpers/db";
import { logger } from "~/services/logger.server";
import { isFailure } from "~/use-case/result";
import countUsers from "~/use-cases/count-users";

let db: PrismaClient;

beforeAll(async () => {
  db = await createDatabaseClient();
  await db.$connect();
});

afterAll(async () => {
  await db.$disconnect();
});

test("should return the amount of users", async () => {
  let result = await countUsers({}, { db, logger });
  if (isFailure(result)) throw result.error;
  expect(result.value).toBe(1);
});
