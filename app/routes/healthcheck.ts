import countUsers from "~/use-cases/count-users";

export let loader: SDX.LoaderFunction = async ({ context }) => {
  await countUsers(context);
  return new Response("OK", { status: 200 });
};
