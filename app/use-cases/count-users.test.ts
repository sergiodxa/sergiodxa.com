import type { PrismaClient } from "@prisma/client";
import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { createDatabaseClient } from "test/helpers/db";
import { logger } from "~/services/logger.server";
import { isSuccess } from "~/use-case.server";
import countUsers from "./count-users";

let db: PrismaClient;

beforeAll(async () => {
  db = await createDatabaseClient();
  await db.$connect();
});

afterAll(async () => {
  await db.$disconnect();
});

describe("Count users", () => {
  test("should return the amount of users", async () => {
    let result = await countUsers({ db, logger });
    isSuccess(result);
    expect(result.value).toBe(1);
  });
});
