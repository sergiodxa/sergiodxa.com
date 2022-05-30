import { faker } from "@faker-js/faker";
import { type PrismaClient } from "@prisma/client";
import { describe, expect, test } from "vitest";
import { type User } from "~/models/user.server";
import { logger } from "~/services/logger.server";
import { createDatabaseClient } from "~/test/helpers/db";
import { isSuccess } from "~/use-case.server";
import writeAnArticle from "./write-an-article";

let db: PrismaClient;

beforeAll(async () => {
  db = await createDatabaseClient();
  await db.$connect();
});

afterAll(async () => {
  await db.$disconnect();
});

describe("Write an article", () => {
  let userId: User["id"] = "cl3amo1cf000009l04bi86f91";

  test("it should autogenerate the slug and headline", async () => {
    let formData = new FormData();
    formData.set("authorId", userId);
    formData.set("title", faker.random.words(5));
    formData.set("body", faker.lorem.paragraphs(5));

    let result = await writeAnArticle({ db, logger }, formData);

    isSuccess(result);

    expect(result.status).toBe("success");
    expect(result.value).toBeInstanceOf(Object);
  });

  test("it should use the defined slug", async () => {
    let formData = new FormData();

    let random = Math.round(Math.random() * 1000);
    let slug = `test-slug-${random}`;

    formData.set("authorId", userId);
    formData.set("title", faker.random.words(5));
    formData.set("body", faker.lorem.paragraphs(5));
    formData.set("slug", slug);

    let result = await writeAnArticle({ db, logger }, formData);

    isSuccess(result);

    expect(result.status).toBe("success");
    expect(result.value.slug).toBe(slug);
  });

  test("it should use the defined headline", async () => {
    let formData = new FormData();

    let headline = `This is the headline of the article`;

    formData.set("authorId", userId);
    formData.set("title", faker.random.words(5));
    formData.set("body", faker.lorem.paragraphs(5));
    formData.set("headline", headline);

    let result = await writeAnArticle({ db, logger }, formData);

    isSuccess(result);

    expect(result.status).toBe("success");
    expect(result.value.headline).toBe(headline);
  });

  test("it should limit the headline length", async () => {
    let formData = new FormData();

    let body = faker.lorem.words(20);
    let headline = body.split("\n")[0].slice(0, 139) + "…";

    formData.set("authorId", userId);
    formData.set("title", faker.random.words(5));
    formData.set("body", body);
    formData.set("headline", headline);

    let result = await writeAnArticle({ db, logger }, formData);

    isSuccess(result);

    expect(result.status).toBe("success");
    expect(result.value.headline).toBe(headline);
  });
});
