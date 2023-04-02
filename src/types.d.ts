import { URL } from "url";

import { Client } from "openid-client";

import { Authorization } from "./lib/auth.ts";

declare global {
  namespace Express {
    interface Locals {
      // Remember to make every property optional if it will ever be undefined
      authorization: Authorization;
      pageData: unknown;
      oidcClient?: Client;
      applicationUrl: URL;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    oidcNonce?: string;
  }
}

export {};
