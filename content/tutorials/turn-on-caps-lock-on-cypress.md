#cypress@12.5.1

# Turn on Caps Lock on Cypress

If you're testing a feature that depends on Caps Lock to be on, e.g. detect Caps Lock and warn on password inputs. You can test this works on Cypress using the following snippet.

```ts
cy.findByLabelText("Password").trigger("keydown", {
  key: "CapsLock",
  getModifierState: (key) => key === "CapsLock",
});
```

The `findByLabelText` function depends on Cypress Testing Library, use it to find the input elemnt, then call `trigger` with the `keydown` event, pass the `key` and in `getModifierState` return true if the key is CapsLock so it's activated.
