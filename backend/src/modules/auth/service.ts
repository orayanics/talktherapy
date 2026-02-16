// Service handle business logic, decoupled from Elysia controller
import { status } from "elysia";
import type { AuthModel } from "./model";
import { sql } from "bun";

// If the class doesn't need to store a property,
// you may use `abstract class` to avoid class allocation
export abstract class Auth {
  static async signIn({ email, password }: AuthModel.signInBody) {
    const user = await sql`
			SELECT password
			FROM users
			WHERE email = ${email}
			LIMIT 1`;

    if (!(await Bun.password.verify(password, user.password)))
      // You can throw an HTTP error directly
      throw status(
        400,
        "Invalid email or password" satisfies AuthModel.signInInvalid,
      );

    return {
      email: user.email,
      token: await generateAndSaveTokenToDB(user.id),
    };
  }
}
