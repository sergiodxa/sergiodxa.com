import { PrismaClient } from "@prisma/client";
import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { logger } from "~/services/logger.server";
import { isSuccess } from "~/use-case.server";
import countUsers from "./count-users";

let db: PrismaClient;

beforeAll(async () => {
  db = new PrismaClient({
    datasources: { db: { url: "file:./test.db?mode=memory&cache=shared" } },
  });
  await db.$connect();
});

afterAll(async () => {
  await db.$disconnect();
});

describe("Count users", () => {
  test("should return the amount of users", async () => {
    let count = await db.user.count();
    let result = await countUsers({ db, logger });
    isSuccess(result);
    expect(result.value).toBe(count);
  });
});
