import { Authorization } from "./lib/auth.ts";

declare global {
  namespace Express {
    interface Locals {
      // Remember to make every property optional
      pageData?: {
        isLoggedIn?: boolean;
      };
      authorization?: Authorization;
    }
  }
}

export {};
