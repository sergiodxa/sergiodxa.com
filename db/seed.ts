import { PrismaClient } from "@prisma/client";

async function seed() {
  let client = new PrismaClient();
  await client.user.create({
    data: {
      id: "cl3amo1cf000009l04bi86f91",
      email: "hello@sergiodxa.com",
      displayName: "Sergio Xalambrí",
      avatar:
        "https://avatars2.githubusercontent.com/u/1709898?s=460&v=4https://avatars.githubusercontent.com/u/1312018?v=4",
    },
  });
}

seed()
  .then(() => {
    console.log("Seed completed");
  })
  .catch((error) => {
    console.log("Seed failed");
  });
