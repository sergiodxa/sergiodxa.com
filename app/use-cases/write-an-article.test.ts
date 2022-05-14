import { PrismaClient } from "@prisma/client";
import { test, expect } from "vitest";
import { logger } from "~/services/logger.server";
import writeAnArticle from "./write-an-article";
import { faker } from "@faker-js/faker";
import { isSuccess } from "~/use-case.server";

let db: PrismaClient;

beforeAll(async () => {
  db = new PrismaClient();
  await db.$connect();
});

afterAll(async () => {
  await db.$disconnect();
});

test("Write an article", async () => {
  let users = await db.user.findMany();

  let formData = new FormData();
  formData.set("authorId", users[0].id);
  formData.set("title", faker.random.words(5));
  formData.set("body", faker.lorem.paragraphs(5));

  let result = await writeAnArticle({ db, logger }, formData);

  isSuccess(result);

  expect(result.status).toBe("success");
  expect(result.value).toBeInstanceOf(Object);
});
