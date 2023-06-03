import "reflect-metadata";
import type { Options as SequelizeOptions } from "@sequelize/core";
import { Sequelize } from "@sequelize/core";

import { logError, logFatal, logInfo, sqlLogger } from "./logger.js";
import { ConfigurationModel } from "./models/Configuration.js";
import { EventModel } from "./models/Event.js";
import { ImageModel } from "./models/Image.js";
import { LoginFlowSessionModel } from "./models/LoginFlowSession.js";
import { PersonModel } from "./models/Person.js";
import { PointEntryModel } from "./models/PointEntry.js";
import { TeamModel } from "./models/Team.js";
// Seeders
import seedEvents from "./seeders/events.js";
import seedImages from "./seeders/images.js";
import seedPeople from "./seeders/people.js";

if (
  !process.env.DB_HOST ||
  !process.env.DB_PORT ||
  !process.env.DB_UNAME ||
  !process.env.DB_PWD ||
  !process.env.DB_NAME
) {
  throw new Error("Missing database connection information");
}

Sequelize.hooks.addListeners({
  beforeInit: (config) => {
    sqlLogger.log("info", "Initializing Sequelize", {
      database: config.database,
      schema: config.schema,
      applicationName: config.dialectOptions?.applicationName as
        | string
        | undefined,
      models: config.models?.map((model) => model.name),
    });
  },
  afterInit: (sequelizeInstance) => {
    sqlLogger.log("info", "Sequelize initialized", {
      database: sequelizeInstance.config.database,
      schema: sequelizeInstance.config.dialectOptions.schema,
      applicationName: sequelizeInstance.config.dialectOptions
        .applicationName as string | undefined,
    });
  },
});

const models = [
  ConfigurationModel,
  EventModel,
  ImageModel,
  LoginFlowSessionModel,
  PersonModel,
  PointEntryModel,
  TeamModel,
];

// const models = await importModels(pathUrls);

const dbOptions = {
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT, 10),
  logging: (sql: string, timing?: number | undefined) =>
    sqlLogger.log("sql", sql, { timing }),
  benchmark: true, // Dev
  models,
  define: {
    underscored: true,
    paranoid: true,
    schema: "danceblue",
  },
  dialectOptions: {
    application_name: "db-server",
  },
} satisfies SequelizeOptions;

export const sequelizeDb = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_UNAME,
  process.env.DB_PWD,
  dbOptions
);

sequelizeDb.hooks.addListeners({
  beforeConnect: (config) =>
    void sqlLogger.log("info", "Connecting to database", {
      host: config.host,
      port: config.port,
      username: config.username,
      database: config.database,
      schema: config.dialectOptions?.schema,
    }),
  afterConnect: () => void sqlLogger.log("info", "Connected to database"),
  beforeDisconnect: () =>
    void sqlLogger.log("info", "Disconnecting from database"),
  afterDisconnect: () =>
    void sqlLogger.log("info", "Database connection closed"),
});

try {
  await sequelizeDb.authenticate();
  logInfo("Database connection tested successfully.");
} catch (error) {
  logError("Unable to connect to the database:", error);
  logFatal("Shutting down due to database connection failure");
}

await sequelizeDb.createSchema("danceblue");

await sequelizeDb.sync({
  force: true,
  alter: true,
  logging: dbOptions.logging,
});

const enableSeeders = true;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (enableSeeders) {
  await seedImages();
  await seedPeople();
  await seedEvents();
}
