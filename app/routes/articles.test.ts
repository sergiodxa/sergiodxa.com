import { test, expect } from "vitest";
import "pptr-testing-library/extend";
import { type App, start } from "test/helpers/app";

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
