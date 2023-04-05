import { URL } from "url";

import { Client } from "openid-client";

import { UserData } from "./lib/auth.ts";

declare global {
  namespace Express {
    interface Locals {
      // Remember to make every property optional if it will ever be undefined
      userData: UserData;
      shownPages?: { slug: string; title: string }[];
      applicationUrl: URL;

      // Auth flow
      oidcClient?: Client;
    }
  }
  namespace NodeJS {
    type ProcessEnv = Readonly<{
      NODE_ENV?: "development" | "production";
      APPLICATION_PORT?: string;
      APPLICATION_HOST?: string;

      ASSET_PATH?: string;

      COOKIE_SECRET?: string;
      JWT_SECRET?: string;

      DB_HOST?: string;
      DB_PORT?: string;
      DB_UNAME?: string;
      DB_PWD?: string;
      DB_NAME?: string;

      // These don't need to be optional because they are checked in index.ts
      MS_OIDC_URL?: string;
      MS_CLIENT_ID?: string;
      MS_CLIENT_SECRET?: string;
    }>;
  }
}

// declare module "express-session" {
//   interface SessionData {
//   }
// }

export {};
