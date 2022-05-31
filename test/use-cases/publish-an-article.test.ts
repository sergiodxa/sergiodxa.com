import faker from "@faker-js/faker";
import { type PrismaClient } from "@prisma/client";
import { parameterize } from "inflected";
import { afterAll, beforeAll, test } from "vitest";
import { createDatabaseClient } from "~/helpers/db";
import { logger } from "~/services/logger.server";
import publishAnArticle from "~/use-cases/publish-an-article";

let db: PrismaClient;

beforeAll(async () => {
  db = await createDatabaseClient();
  await db.$connect();
});

afterAll(async () => {
  await db.$disconnect();
});

test("mark an article as status = published", async () => {
  let title = faker.lorem.sentence();

  let article = await db.article.create({
    data: {
      title,
      slug: parameterize(title),
      body: faker.lorem.paragraphs(5),
      headline: faker.lorem.sentence(140),
      authorId: "cl3amo1cf000009l04bi86f91",
      status: "draft",
    },
  });

  let result = await publishAnArticle(
    { articleId: article.id },
    { db, logger }
  );

  expect(result.status).toBe("success");
});
