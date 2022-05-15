import { PrismaClient } from "@prisma/client";
import { test, expect, describe } from "vitest";
import { logger } from "~/services/logger.server";
import writeAnArticle from "./write-an-article";
import { faker } from "@faker-js/faker";
import { isSuccess } from "~/use-case.server";
import { type User, userModel } from "~/models/user.server";

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

describe("Write an article", () => {
  let userId: User["id"];

  beforeAll(async () => {
    let user = await db.user.create({
      data: {
        email: faker.internet.email(),
        displayName: faker.name.findName(),
        avatar: faker.internet.avatar(),
      },
    });

    userId = userModel.parse(user).id;
  });

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
