import "reflect-metadata";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { DataSource } from "typeorm";

import { CustomNamingStrategy } from "./NamingStrategy.js";
import { Client } from "./entity/Client.js";
import { Event } from "./entity/Event.js";
import { Image } from "./entity/Image.js";
import { Notification } from "./entity/Notification.js";
import { User } from "./entity/User.js";

dotenv.config();

console.log(
  process.env.DB_HOST,
  process.env.DB_PORT,
  process.env.DB_UNAME,
  process.env.DB_PWD,
  process.env.DB_NAME
);

export const AppDataSource = new DataSource({
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
    Event,
    User,
    Image,
    Notification,
    Client
  ],
  migrations: [],
  subscribers: [],
  uuidExtension: "pgcrypto",
  namingStrategy: new CustomNamingStrategy(),
  useUTC: true,
  // DANGER!!!
  dropSchema: true,
});
