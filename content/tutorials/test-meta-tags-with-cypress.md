#cypress@12.5.1

# Test meta tags with Cypress

If you want to ensure your webs have the correct meta tags like the title, description, Open Graph or Twitter Cards.

We can test the title using a built-in Cypress command.

```ts
cy.title().should("eq", "Test meta tags with Cypress");
```

For meta tags, we will need to first find them on the document, but we can use custom commands to help us avoid repetitive code.

```ts
// cypress/support/commands.ts
Cypress.Commands.add("metatag", (name: string) => {
  return cy.get(`head > meta[name="${name}"]`);
});

// types.d.ts
declare namespace Cypress {
  interface Chainable<Subject> {
    metatag(name: string): Chainable<JQuery<HTMLMetaElement>>;
    metatag(name: string): Chainable<Subject>;
  }
}
```

This command let use find a metatag using its name, so now we could do:

```ts
cy.metatag("description").should(
  "have.attr",
  "content",
  "An article about testing meta tags with Cypress",
);
```

For the Open Graph and Twitter Card tags, we can do something similar but using the property attribute of the meta tag, we could also prefix the name with `og:` or `twitter:`.

```ts
// cypress/support/commands.ts
Cypress.Commands.add("og", (name: string) => {
  return cy.get(`head > meta[property="og:${name}"]`);
});

Cypress.Commands.add("twitter", (name: string) => {
  return cy.get(`head > meta[name="twitter:${name}"]`);
});

// types.d.ts
declare namespace Cypress {
  interface Chainable<Subject> {
    og(name: string): Chainable<JQuery<HTMLMetaElement>>;
    og(name: string): Chainable<Subject>;

    twitter(name: string): Chainable<JQuery<HTMLMetaElement>>;
    twitter(name: string): Chainable<Subject>;
  }
}
```

And use it in our tests.

```ts
cy.og("title").should("have.attr", "content", "OG Title");
cy.twitter("title").should(
  "have.attr",
  "content",
  "Twitter Card Title"
);
```

With a combination of `cy.metatag`, `cy.og` and `cy.twitter` we can now test any meta tag our HTML may include and ensure we don't break them in a future change.
