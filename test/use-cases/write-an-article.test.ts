import { faker } from "@faker-js/faker";
import { type PrismaClient, type User } from "@prisma/client";
import { expect, test } from "vitest";
import { createDatabaseClient } from "~/helpers/db";
import { logger } from "~/services/logger.server";
import { isFailure } from "~/use-case/result";
import writeAnArticle from "~/use-cases/write-an-article";

const USER_ID: User["id"] = "cl3amo1cf000009l04bi86f91";
let db: PrismaClient;

beforeAll(async () => {
  db = await createDatabaseClient();
  await db.$connect();
});

afterAll(async () => {
  await db.$disconnect();
});

test("it should autogenerate the slug and headline", async () => {
  let result = await writeAnArticle(
    {
      authorId: USER_ID,
      title: faker.random.words(5),
      body: faker.lorem.paragraphs(5),
    },
    { db, logger }
  );

  if (isFailure(result)) throw result.error;

  expect(result.status).toBe("success");
  expect(result.value).toBeInstanceOf(Object);
});

test("it should use the defined slug", async () => {
  let random = Math.round(Math.random() * 1000);
  let slug = `test-slug-${random}`;

  let result = await writeAnArticle(
    {
      authorId: USER_ID,
      title: faker.random.words(5),
      body: faker.lorem.paragraphs(5),
      slug,
    },
    { db, logger }
  );

  if (isFailure(result)) throw result.error;

  expect(result.status).toBe("success");
  expect(result.value.slug).toBe(slug);
});

test("it should use the defined headline", async () => {
  let headline = `This is the headline of the article`;

  let result = await writeAnArticle(
    {
      authorId: USER_ID,
      title: faker.random.words(5),
      body: faker.lorem.paragraphs(5),
      headline: headline,
    },
    { db, logger }
  );

  if (isFailure(result)) throw result.error;

  expect(result.status).toBe("success");
  expect(result.value.headline).toBe(headline);
});

test("it should limit the headline length", async () => {
  let body = faker.lorem.words(20);
  let headline = body.split("\n")[0].slice(0, 139) + "…";

  let result = await writeAnArticle(
    {
      authorId: USER_ID,
      title: faker.random.words(5),
      body: body,
      headline: headline,
    },
    { db, logger }
  );

  if (isFailure(result)) throw result.error;

  expect(result.status).toBe("success");
  expect(result.value.headline).toBe(headline);
});
