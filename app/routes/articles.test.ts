import { test, expect } from "vitest";
import "pptr-testing-library/extend";
import { type App, start } from "test/helpers/app";
import { loader } from "./articles";
import { logger } from "~/services/logger.server";
import { PrismaClient } from "@prisma/client";

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

    let $h2 = await document.findByRole("heading", {
      name: "Articles",
      level: 1,
    });

    expect(await $h2.getNodeText()).toBe("Articles");
  });
});

describe("Loader", () => {
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
