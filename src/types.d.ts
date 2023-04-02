import { Authorization } from "./lib/auth.ts";

declare global {
  namespace Express {
    interface Locals {
      // Remember to make every property optional if it will ever be undefined
      authorization: Authorization;
      pageData: unknown;
    }
  }
}

export {};
