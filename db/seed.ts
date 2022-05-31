import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import cuid from "cuid";
import { parameterize } from "inflected";

faker.seed(1);

const USER_ID = "cl3amo1cf000009l04bi86f91";
const MS_OF_2015 = new Date("2015-01-01").getTime();
const NOW = Date.now();

async function seed() {
  let client = new PrismaClient();

  await client.user.create({
    data: {
      id: USER_ID,
      email: "hello@sergiodxa.com",
      displayName: "Sergio Xalambrí",
      avatar: "https://avatars.githubusercontent.com/u/1312018?v=4",
    },
  });

  await Promise.all(
    faker.datatype.array(10).map(() => {
      let title = faker.lorem.sentence();

      return client.article.create({
        data: {
          id: cuid(),
          title,
          slug: parameterize(title),
          body: faker.lorem.paragraphs(5),
          headline: faker.lorem.sentence(140),
          authorId: USER_ID,
          status: "published",
          createdAt: faker.datatype.datetime({ min: MS_OF_2015, max: NOW }),
        },
      });
    })
  );
}

seed()
  .then(() => {
    console.log("Seed completed");
  })
  .catch((error) => {
    console.log("Seed failed");
  });
