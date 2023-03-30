declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      DB_HOST: string;
      DB_PORT: string;
      DB_UNAME: string;
      DB_PWD: string;
      DB_NAME: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
