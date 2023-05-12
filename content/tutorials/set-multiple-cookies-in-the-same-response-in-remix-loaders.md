#@remix-run/node@16.0.0 #@remix-run/cloudflare@16.0.0

# Set multiple cookies in the same response in Remix loaders

It's common to set more than one cookie from a loader response, probably the cookie for your session and another extra cookie for anything else.

But if you try to do it, you may have found with questions because doing this:

```ts
return json(data, {
  headers: {
    "Set-Cookie": cookie1,
    "Set-Cookie": cookie2,
  },
});
```

Only one of those cookies will be applied if we do that. So let's see what approach we can use.

## Headers as an array of entries

The `headers` key can be either an object where each key is a header name or an array of entries (`[key, value]`). This approach will let us set the exact key multiple times. Ideal to use more than one cookie.

```ts
return json(data, {
  headers: [
    ["Set-Cookie", cookie1],
    ["Set-Cookie", cookie2],
  ],
});
```

## Using `headers.append`

Another option is to create a `Headers` object instance first and then use `headers.append` to set the header name.

```ts
let headers = new Headers();
headers.append("Set-Cookie", cookie1);
headers.append("Set-Cookie", cookie2);
return json(data, { headers });
```

It's essential to use `headers.append` and not `headers.set`. The first lets you set the exact header more than once, and the second will put it only once, replacing the previous ones.
