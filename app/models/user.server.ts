import type { User } from "@prisma/client";
import { compare, hash } from "bcrypt";
import md5 from "md5";
import { db } from "~/services/db.server";
import { pick } from "~/utils/objects";

export type PublicUser = Pick<User, "id" | "displayName" | "avatar" | "role">;

type FormBody = { email: string; password: string };
type GitHubBody = { email: string; displayName: string; avatar: string };

export async function login(
  provider: "form",
  body: FormBody
): Promise<PublicUser>;
export async function login(
  provider: "github",
  body: GitHubBody
): Promise<PublicUser>;
export async function login(
  provider: "form" | "github",
  body: FormBody | GitHubBody
): Promise<PublicUser> {
  switch (provider) {
    case "form": {
      let { email, password } = body as FormBody;

      let user = await db.user.findUnique({ where: { email } });

      if (!user) throw new Error("Invalid credentials");

      let passwordHash = await hash(password, 10);

      if (!(await compare(password, passwordHash))) {
        throw new Error("Invalid credentials");
      }

      return pick(user, ["id", "displayName", "avatar", "role"]);
    }

    case "github": {
      let { email, displayName, avatar } = body as GitHubBody;
      return await db.user.upsert({
        where: { email },
        select: { id: true, displayName: true, avatar: true, role: true },
        update: { displayName, avatar },
        create: { email, displayName, avatar },
      });
    }
  }
}

export async function signup({
  email,
  displayName,
  password,
}: {
  email: string;
  displayName: string;
  password: string;
}) {
  let passwordHash = await hash(password, 10);
  let emailHash = md5(email);
  let avatar = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
  try {
    return await db.user.create({
      select: { id: true, displayName: true, avatar: true, role: true },
      data: { email, displayName, password: passwordHash, avatar },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes(
          "Unique constraint failed on the fields: (`email`)"
        )
      ) {
        throw new Error("Email already in use.");
      }
    }
    throw new Error("Failed to create user.");
  }
}
