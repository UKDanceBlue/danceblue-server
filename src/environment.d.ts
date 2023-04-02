declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: "development" | "production";
      APPLICATION_PORT?: string;
      APPLICATION_HOST?: string;

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
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
