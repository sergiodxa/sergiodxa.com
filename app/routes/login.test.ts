import { test, expect, beforeAll, afterAll } from "vitest";
import "pptr-testing-library/extend";
import { type App, start } from "test/helpers/app";

describe("E2E", () => {
  let app: App;

  beforeAll(async () => {
    app = await start();
  });

  afterAll(async () => {
    await app.stop();
  });

  test("Login page should render", async () => {
    let document = await app.navigate("/login");
    let $h2 = await document.findByRole("heading", {
      name: "Sign in to your account",
      level: 2,
    });
    expect(await $h2.getNodeText()).toBe("Sign in to your account");

    let $button = await document.findByRole("button", {
      name: "Sign in with GitHub",
    });
    await $button.click();

    await app.page.waitForNavigation();

    let url = app.page.url();
    expect(url.includes("github.com")).toBeTruthy();
  });
});
