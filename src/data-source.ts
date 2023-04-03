import "reflect-metadata";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";

import { CustomNamingStrategy } from "./NamingStrategy.js";
import { Client } from "./entity/Client.js";
import { Configuration } from "./entity/Configuration.js";
import { Event } from "./entity/Event.js";
import { Image } from "./entity/Image.js";
import { Notification } from "./entity/Notification.js";
import { Person } from "./entity/Person.js";
import { PointEntry } from "./entity/PointEntry.js";
import { PointOpportunity } from "./entity/PointOpportunity.js";
import { Team } from "./entity/Team.js";

dotenv.config();

if (
  !process.env.DB_HOST ||
  !process.env.DB_PORT ||
  !process.env.DB_UNAME ||
  !process.env.DB_PWD ||
  !process.env.DB_NAME
) {
  throw new Error("Missing database connection information");
}

export const appDataSource = new DataSource({
  type: "postgres",
  schema: "danceblue",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_UNAME,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    Client,
    Configuration,
    Event,
    Image,
    Notification,
    Person,
    PointEntry,
    PointOpportunity,
    Team,
  ],
  migrations: [],
  subscribers: [],
  uuidExtension: "pgcrypto",
  namingStrategy: new CustomNamingStrategy(),
  useUTC: true,
  // DANGER!!!
  dropSchema: true,
});
