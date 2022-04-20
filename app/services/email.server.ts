// app/services/email.server.tsx
import type { SendEmailFunction } from "remix-auth-email-link";
import type { PublicUser } from "~/models/user.server";

export let sendEmail: SendEmailFunction<PublicUser> = async (options) => {
  // let subject = "Here's your Magic sign-in link";
  // let body = renderToString(
  //   <p>
  //     Hi {options.user?.displayName || "there"},<br />
  //     <br />
  //     <a href={options.magicLink}>Click here to login on example.app</a>
  //   </p>
  // );

  console.log("Sending email to", options.emailAddress);
  console.log("Magic Link:", options.magicLink);
};
