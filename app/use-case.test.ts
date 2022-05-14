import { test } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createUseCase } from "~/use-case.server";

let useCase = createUseCase({
  schema: (z) => z.object({}),
  async perform(context) {
    return await context.db.user.count();
  },
});

let db: PrismaClient;

beforeAll(async () => {
  db = new PrismaClient();
  await db.$connect();
});

afterAll(async () => {
  await db.$disconnect();
});

test("should count the number of users", async () => {
  let result = await useCase({ db } as SDX.Context, new FormData());

  expect(result.status).toBe("success");
  if (result.status === "success") {
    expect(result.value).toBe(await db.user.count());
  }
});
