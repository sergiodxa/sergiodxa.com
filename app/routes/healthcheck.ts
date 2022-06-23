export let loader: SDX.LoaderFunction = async ({ context }) => {
  await context.db.user.count();
  return new Response("OK", { status: 200 });
};
