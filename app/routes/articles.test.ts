import type { PrismaClient } from "@prisma/client";
import { test, expect, describe, beforeAll, afterAll } from "vitest";
import "pptr-testing-library/extend";
import { type App, start } from "test/helpers/app";
import { createDatabaseClient, prepareDatabase } from "test/helpers/db";
import { logger } from "~/services/logger.server";
import { loader } from "./articles";

describe("E2E", () => {
  let app: App;

  beforeAll(async () => {
    app = await start();
  });

  afterAll(async () => {
    await app.stop();
  });

  test("Articles page should render list of articles", async () => {
    let document = await app.navigate("/articles");

    let $h1 = await document.findByRole("heading", {
      name: "Articles",
      level: 1,
    });

    expect(await $h1.getNodeText()).toBe("Articles");
  });
});

describe("Integration", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    let url = await prepareDatabase();
    db = await createDatabaseClient(url);
    await db.$connect();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test("The loader should have an articles key", async () => {
    let response = await loader({
      request: new Request("/articles"),
      params: {},
      context: { logger, db },
    });

    let data = await response.json();

    expect(data).toHaveProperty("articles");
    expect(data.articles).toBeInstanceOf(Array);
  });
});
