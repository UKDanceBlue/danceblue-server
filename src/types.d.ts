import { URL } from "url";

import { Client } from "openid-client";

import { UserData } from "./lib/auth.ts";

declare global {
  namespace Express {
    interface Locals {
      // Remember to make every property optional if it will ever be undefined
      userData: UserData;
      shownPages?: { slug: string; title: string }[];
      oidcClient?: Client;
      applicationUrl: URL;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    codeVerifier?: string;
  }
}

export {};
