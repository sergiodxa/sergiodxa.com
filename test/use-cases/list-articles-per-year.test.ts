import { type PrismaClient } from "@prisma/client";
import { expect, test } from "vitest";
import { createDatabaseClient } from "~/helpers/db";
import { logger } from "~/services/logger.server";
import { isFailure } from "~/use-case/result";
import listArticlesPerYear from "~/use-cases/list-articles-per-year";

let db: PrismaClient;

beforeAll(async () => {
  db = await createDatabaseClient();
  await db.$connect();
});

afterAll(async () => {
  await db.$disconnect();
});

test("should list all articles on groups per year", async () => {
  let result = await listArticlesPerYear({}, { db, logger });
  if (isFailure(result)) throw result.error;

  expect(result.status).toBe("success");
  expect(result.value["2017"]).toHaveLength(1);
  expect(result.value["2018"]).toHaveLength(2);
  expect(result.value["2021"]).toHaveLength(6);
  expect(result.value["2022"]).toHaveLength(1);
});
