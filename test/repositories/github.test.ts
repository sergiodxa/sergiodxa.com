import { describe, expect } from "vitest";

import {
	GitHubFileNotFoundError,
	GithubRepository,
} from "~/repositories/github";

describe(GithubRepository.name, () => {
	let repo = new GithubRepository();

	describe(repo.getMarkdownFile.name, () => {
		test("should throw if the file doesn't exists", async () => {
			await expect(repo.getMarkdownFile("not-found")).rejects.toThrowError(
				GitHubFileNotFoundError
			);
		});

		test("should return content if the file exists", async () => {
			await expect(repo.getMarkdownFile("tutorials/about.md")).resolves
				.toMatchInlineSnapshot(`
			{
			  "file": {
			    "attributes": {
			      "tags": [],
			      "title": "About",
			    },
			    "body": {
			      "$$mdtype": "Tag",
			      "attributes": {},
			      "children": [
			        {
			          "$$mdtype": "Tag",
			          "attributes": {},
			          "children": [
			            {
			              "$$mdtype": "Tag",
			              "attributes": {
			                "alt": "A photo of me",
			                "src": "https://photos.collectednotes.com/photos/55/ebdece0b-40ee-4452-ad24-6e96064c2695",
			              },
			              "children": [],
			              "name": "img",
			            },
			          ],
			          "name": "p",
			        },
			        {
			          "$$mdtype": "Tag",
			          "attributes": {},
			          "children": [
			            "Hi there! I'm a web developer currently based on Lima, Perú.",
			          ],
			          "name": "p",
			        },
			        {
			          "$$mdtype": "Tag",
			          "attributes": {},
			          "children": [
			            "I'm currently working in ",
			            {
			              "$$mdtype": "Tag",
			              "attributes": {
			                "href": "https://silverback.ventures",
			              },
			              "children": [
			                "Silverback Ventures",
			              ],
			              "name": "a",
			            },
			            " as the web developer for our product, before I worked at ",
			            {
			              "$$mdtype": "Tag",
			              "attributes": {
			                "href": "https://able.co",
			              },
			              "children": [
			                "Able",
			              ],
			              "name": "a",
			            },
			            ", ",
			            {
			              "$$mdtype": "Tag",
			              "attributes": {
			                "href": "https://vercel.com",
			              },
			              "children": [
			                "Vercel",
			              ],
			              "name": "a",
			            },
			            ", and ",
			            {
			              "$$mdtype": "Tag",
			              "attributes": {
			                "href": "https://platzi.com",
			              },
			              "children": [
			                "Platzi",
			              ],
			              "name": "a",
			            },
			            ".",
			          ],
			          "name": "p",
			        },
			        {
			          "$$mdtype": "Tag",
			          "attributes": {},
			          "children": [
			            "I have also taught Web Development at Platzi and ",
			            {
			              "$$mdtype": "Tag",
			              "attributes": {
			                "href": "https://codeable.la",
			              },
			              "children": [
			                "Codeable",
			              ],
			              "name": "a",
			            },
			            ", a full-stack development bootcamp created by Able to teach our development stack, React and Rails. At Codeable I created the initial curriculum for Frontend.",
			          ],
			          "name": "p",
			        },
			      ],
			      "name": "article",
			    },
			  },
			  "path": "content/tutorials/about.md",
			}
		`);
		});
	});
});
