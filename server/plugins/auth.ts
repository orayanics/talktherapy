// plugins/auth.ts
import { Elysia } from "elysia";
import { auth } from "../auth";

/**
 * Authentication plugin using Elysia macro pattern
 * Provides session validation and user context
 */
export const authPlugin = new Elysia({ name: "auth-plugin" })
  // Mount Better Auth handlers
  .all("/api/auth/*", ({ request }) => auth.handler(request))

  // Define authentication macro
  .macro({
    isAuth: {
      // Use resolve to add session/user to context before route handler
      async resolve({ request, error }) {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session) {
          return error(401, {
            error: "Unauthorized",
            message: "You must be logged in to access this resource",
          });
        }

        // Add session and user to context
        return {
          session: session.session,
          user: session.user,
        };
      },
    },
  });

// Export type for use in other files
export type AuthPlugin = typeof authPlugin;
