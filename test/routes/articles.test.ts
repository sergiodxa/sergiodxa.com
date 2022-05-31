import { type PrismaClient } from "@prisma/client";
import "pptr-testing-library/extend";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { start, type App } from "~/helpers/app";
import { createDatabaseClient } from "~/helpers/db";
import { loader } from "~/routes/articles";
import { logger } from "~/services/logger.server";

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

    let listItems = await document.findAllByRole("listitem");
    expect(listItems).toHaveLength(14);
  });
});

describe("Integration", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await createDatabaseClient();
    await db.$connect();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test("The loader should have an articles key", async () => {
    let response = await loader({
      request: new Request("http://sergiodxa.dev/articles"),
      params: {},
      context: { logger, db },
    });

    let data = await response.json();

    expect(data.articlesPerYear["2017"]).toHaveLength(1);
    expect(data.articlesPerYear["2018"]).toHaveLength(2);
    expect(data.articlesPerYear["2021"]).toHaveLength(6);
    expect(data.articlesPerYear["2022"]).toHaveLength(1);
  });
});
