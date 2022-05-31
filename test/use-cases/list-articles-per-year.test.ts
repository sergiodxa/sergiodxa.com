import { type PrismaClient } from "@prisma/client";
import { describe, expect, test } from "vitest";
import { createDatabaseClient } from "~/helpers/db";
import { logger } from "~/services/logger.server";
import listArticlesPerYear from "~/use-cases/list-articles-per-year";

let db: PrismaClient;

beforeAll(async () => {
  db = await createDatabaseClient();
  await db.$connect();
});

afterAll(async () => {
  await db.$disconnect();
});

describe("List articles per year", () => {
  test("should list all articles on groups per year", async () => {
    let formData = new URLSearchParams();
    let result = await listArticlesPerYear({ db, logger }, formData);

    if (listArticlesPerYear.isFailure(result)) throw result.error;

    expect(result.status).toBe("success");
    expect(result.value["2016"]).toHaveLength(1);
    expect(result.value["2017"]).toHaveLength(2);
    expect(result.value["2018"]).toHaveLength(1);
    expect(result.value["2019"]).toHaveLength(1);
    expect(result.value["2021"]).toHaveLength(2);
    expect(result.value["2022"]).toHaveLength(3);
  });
});
