import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      // Optional: configure password requirements
      // minLength: 8,
      // requireUppercase: true,
      // requireLowercase: true,
      // requireNumbers: true,
      // requireSpecialCharacters: true,
    }),
  ],
});
