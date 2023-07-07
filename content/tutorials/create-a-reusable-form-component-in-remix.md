#@remix-run/react@1.18.1

# Create a reusable Form component in Remix

Let's say we want to build a custom Form component for our application, this Form will do things inside like rendering a hidden input with a CSRF token, accepts a redirectTo to send in the body, or just apply some styles that all forms will have.

The first approach to build something like this could be to wrap the Remix's Form component.

```tsx
import type { FormProps as RemixFormProps } from "@remix-run/react";

import { Form as RemixForm } from "@remix-run/react";

type FormProps = RemixFormProps & {
  redirectTo?: string;
};

export function Form({ redirectTo, children, ...props }: FormProps) {
  return (
    <RemixForm {...props} className="some classes">
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}
      <CSRFTokenInput />
      {children}
    </RemixForm>
  );
}
```

This will work, until you want to swap out RemixForm with a `fetcher.Form`. To solve that we can accept the component as a prop!

```tsx
type FormProps = RemixFormProps & {
  redirectTo?: string;
  form?: React.ComponentType<FormProps>;
};

export function Form({
  redirectTo,
  children,
  // here we default to RemixForm
  form: Component = RemixForm,
  ...props
}: FormProps) {
  return (
    <Component {...props} className="some classes">
      {/* content here */}
    </Component>
  );
}
```

And finally, we can use it in a route or any other component:

```tsx
function Route() {
  let fetcher = useFetcher();

  return (
    <>
      <Form />; // with the default
      <Form form={fetcher.Form} />; // with a fetcher
    </>
  );
}
```

This pattern is the same that [remix-form](https://remix-forms.seasoned.cc) uses to let you pass Form or fetcher.Form, from Remix or React Router.
