#remix-auth@3.4.0

# Logout from Auth0 with Remix Auth

If you're using Remix Auth together with Auth0, you may found out that if you just use the logout method from Remix Auth and try to login again Auth0 will still consider you authenticated.

This happens because the Remix Auth method logs you out on your Remix app but can't do the same in Auth0, but there's a way.

If you have an action like this one:

```ts
export async function action({ request }: DataFunctionArgs) {
  return await auth.logout(request, { redirectTo: "/" });
}
```

Replace it with the following action:

```ts
export async function action({ request }: DataFunctionArgs) {
  let redirectTo = new URL(`https://${AUTH0_DOMAIN}/v2/logout`);
  redirectTo.searchParams.set("returnTo", "https://example.com/");
  redirectTo.searchParams.set("client_id", AUTH0_CLIENT_ID);
  return await auth.logout(request, {
    redirectTo: redirectTo.toString()
  });
}
```

Now, after Remix Auth logs you out of your application, it will redirect you to Auth0, which will also logs you out and then redirect you back to your `returnTo` URL which in our example is our index route.
