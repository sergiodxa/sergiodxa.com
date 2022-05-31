import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, test } from "vitest";
import { createDatabaseClient } from "~/helpers/db";
import { logger } from "~/services/logger.server";
import { ValidationError } from "~/use-case/errors";
import { isFailure, isSuccess } from "~/use-case/result";
import readAnArticle from "~/use-cases/read-an-article";

let db: PrismaClient;
let context: SDX.Context;

beforeAll(async () => {
  db = await createDatabaseClient();
  await db.$connect();
  context = { db, logger };
});

afterAll(async () => {
  await db.$disconnect();
});

test("return the article if it exists", async () => {
  let article = await db.article.findFirst();
  if (!article) throw new Error("Run the seed!");

  let result = await readAnArticle({ slug: article.slug }, context);

  if (isFailure(result)) throw result.error;
  expect(result.value).toEqual(article);
});

test("return null if the article doesn't exists", async () => {
  let result = await readAnArticle({ slug: "random-slug" }, context);

  if (isFailure(result)) throw result.error;
  expect(result.value).toBeNull();
});

test("throw if the articleId is missing", async () => {
  let result = await readAnArticle({}, context);

  if (isSuccess(result)) throw new Error("Expected failure");
  expect(result.error).toBeInstanceOf(ValidationError);
});

test("throw if the articleId is empty", async () => {
  let result = await readAnArticle({ slug: "" }, context);

  if (isSuccess(result)) throw new Error("Expected failure");
  expect(result.error).toBeInstanceOf(ValidationError);
});
