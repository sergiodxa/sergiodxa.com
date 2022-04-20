// import { open, type App } from "test/helpers/app";
import { test, expect } from "vitest";
import puppeteer from "puppeteer";
import "pptr-testing-library/extend";

// let app: App;

// beforeAll(async () => {
//   app = await open();
// });

// afterAll(async () => {
//   await app.close();
// });

test("Login page should render", async () => {
  let browser = await puppeteer.launch();
  let page = await browser.newPage();
  await page.goto("http://localhost:3000/login");
  let document = await page.getDocument();
  let $h2 = await document.findByRole("heading", {
    name: "Sign in to your account",
    level: 2,
  });
  expect(await $h2.getNodeText()).toBe("Sign in to your account");
});
