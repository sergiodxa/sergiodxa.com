import "pptr-testing-library/extend";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { start, type App } from "~/helpers/app";

describe("E2E", () => {
	let app: App;

	beforeAll(async () => {
		app = await start();
	});

	afterAll(async () => {
		await app.stop();
	});

	test.only("A non authenticated user should be redirected to login", async () => {
		let response = await app.page.goto(
			new URL("/write", app.baseURL).toString()
		);

		console.log(response.url);

		expect(response.headers().location).toBe("/login");
	});

	test("An authenticated user should be able to write a post", async () => {
		await app.login("cl3amo1cf000009l04bi86f91");

		let document = await app.navigate("/write");

		let $button = await document.findByRole("button", {
			name: "Create",
		});

		expect(await $button.getNodeText()).toBe("Create");
	});
});
