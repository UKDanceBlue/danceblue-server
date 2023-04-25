import "reflect-metadata";
import path from "node:path";

import { Sequelize, importModels } from "@sequelize/core";

import { logError, logFatal, logInfo, sqlLogger } from "./logger.js";

if (
  !process.env.DB_HOST ||
  !process.env.DB_PORT ||
  !process.env.DB_UNAME ||
  !process.env.DB_PWD ||
  !process.env.DB_NAME
) {
  throw new Error("Missing database connection information");
}

const models = await importModels(
  path.join(import.meta.url, "..", "models", "*.js")
);

export const sequelizeDb = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_UNAME,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  logging: sqlLogger.info.bind(sqlLogger),
  models,
});

await sequelizeDb.sync();

try {
  await sequelizeDb.authenticate();
  logInfo("Connection has been established successfully.");
} catch (error) {
  logError("Unable to connect to the database:", error);
  logFatal("Shutting down due to database connection failure");
}
