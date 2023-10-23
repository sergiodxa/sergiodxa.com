#react@18.2.0 #@remix-run/node@2.1.0 #@remix-run/react@2.1.0

# Upload Images in a Remix Application

If you want to add file upload to let users send you images, e.g., for an avatar, Remix provides a few (still unstable for some reason) tools to do so.

> tl;dr: Here's a repository with an app using this code:
> https://github.com/sergiodxa/remix-demo-file-upload

Let's start by importing the file upload functions and other things we'll need.

```ts
import {
  json,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  unstable_createFileUploadHandler,
  unstable_composeUploadHandlers,
} from "@remix-run/node";
import type { NodeOnDiskFile, ActionFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
```

Now, let's use them in an action function. We'll use `unstable_parseMultipartFormData` instead of `request.formData()` to parse the request body, allowing us to use an upload handler to save the uploaded files.

As our upload handler, we'll compose `unstable_createFileUploadHandler` to save the files to disk and `unstable_createMemoryUploadHandler` to keep any other FormData entry in memory.

The return of our action will be a JSON object with the list of files we just uploaded, including the name and the URL.

```ts
export async function action({ request }: ActionFunctionArgs) {
  let formData = await unstable_parseMultipartFormData(
    request,
    unstable_composeUploadHandlers(
      unstable_createFileUploadHandler({
        // Limit file upload to images
        filter({ contentType }) {
          return contentType.includes("image");
        },
        // Store the images in the public/img folder
        directory: "./public/img",
        // By default, `unstable_createFileUploadHandler` adds a number to the file
        // names if there's another with the same name; by disabling it, we replace
        // the old file
        avoidFileConflicts: false,
        // Use the actual filename as the final filename
        file({ filename }) {
          return filename;
        },
        // Limit the max size to 10MB
        maxPartSize: 10 * 1024 * 1024,
      }),
      unstable_createMemoryUploadHandler(),
    ),
  );

  let files = formData.getAll("file") as NodeOnDiskFile[];
  return json({
    files: files.map((file) => ({ name: file.name, url: `/img/${file.name}` })),
  });
}
```

Now, let's create a hook to contain our logic. We don't really need it to be a hook, but for the sake of the example and to reduce code block size, we'll make it one.

This hook will use a [Remix fetcher](https://remix.run/docs/en/main/hooks/use-fetcher) to let us upload the files from the browser.

We'll expose `submit`, `isUploading` if the state is not `idle`, and the list of images combining the ones we're uploading and the ones we've already uploaded.

```ts
function useFileUpload() {
  let { submit, data, state, formData } = useFetcher<typeof action>();
  let isUploading = state !== "idle";

  let uploadingFiles = formData
    ?.getAll("file")
    ?.filter((value: unknown): value is File => value instanceof File)
    .map((file) => {
      let name = file.name;
      // This line is important; it will create an Object URL, which is a `blob:` URL string
      // We'll need this to render the image in the browser as it's being uploaded
      let url = URL.createObjectURL(file);
      return { name, url };
    });

  let images = (data?.files ?? []).concat(uploadingFiles ?? []);

  return {
    submit(files: FileList | null) {
      if (!files) return;
      let formData = new FormData();
      for (let file of files) formData.append("file", file);
      submit(formData, { method: "POST", encType: "multipart/form-data" });
    },
    isUploading,
    images,
  };
}
```

Now we can build our route component using this hook:

```tsx
export default function Component() {
  let { submit, isUploading, images } = useFileUpload();

  return (
    <main>
      <h1>Upload a file</h1>

      <label>
        {/* Here we use our boolean to change the label text */}
        {isUploading ? <p>Uploading image...</p> : <p>Select an image</p>}

        <input
          name="file"
          type="file"
          // We hide the input so we can use our own label as a trigger
          style={{ display: "none" }}
          onChange={(event) => submit(event.currentTarget.files)}
        />
      </label>

      <ul>
        {/*
         * Here we render the list of images, including the ones we're uploading
         * and the ones we've already uploaded
         */}
        {images.map((file) => {
          return <Image key={file.name} name={file.name} url={file.url} />;
        })}
      </ul>
    </main>
  );
}
```

Finally, we need to create a component to render the images. We'll use a component to revoke the object URL and blur the image while it's being uploaded.

Something important is that the `key` needs to be the same between the uploading image and the already uploaded one. This will let us keep the same Image component instance and allow us to do a simple effect once the image is loaded. For this, we use `file.name`, and it's the reason we disabled `avoidFileConflicts` in the upload handler. Another option could be to create a unique ID client-side before the upload.

```tsx
function Image({ name, url }: { name: string; url: string }) {
  // Here we store the object URL in a state to keep it between renders
  let [objectUrl] = useState(() => {
    if (url.startsWith("blob:")) return url;
    return undefined;
  });

  useEffect(() => {
    // If there's an objectUrl but the `url` is not a blob anymore, we revoke it
    if (objectUrl && !url.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
  }, [objectUrl, url]);

  return (
    <img
      alt={name}
      src={url}
      width={320}
      height={240}
      style={{
        // Some styles; here we apply a blur filter when it's being uploaded
        transition: "filter 300ms ease",
        filter: url.startsWith("blob:") ? "blur(4px)" : "blur(0)",
      }}
    />
  );
}
```

With this, if the user clicks the label or drops a file, it will trigger the file input, which will initiate our file upload logic.
