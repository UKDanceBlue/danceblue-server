
import { randomUUID } from "crypto";
import { resolve } from "path";


import bodyParser from "body-parser";
import express from "express";
import session, { SessionOptions } from "express-session";
import createHttpError from "http-errors";

import { appDataSource } from "./data-source.js";
import { defaultAuthorization } from "./lib/auth.js";
import { errorHandler } from "./lib/errorhandler.js";
import apiRouter from "./routes/api/index.js";
import templateRouter from "./routes/template.js";

const port = parseInt(process.env.APPLICATION_PORT ?? "", 10);

await appDataSource.initialize();

const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", resolve("views/pages"));

app.use((req, res, next) => {
  res.locals.authorization = defaultAuthorization();
  res.locals.pageData = {};
  const url: URL = new URL(`${req.protocol}://${process.env.APPLICATION_HOST ?? "_"}`);
  url.port = port.toString();
  res.locals.applicationUrl = url;

  next();
});

const sessionConfig: SessionOptions = {
  secret: "THIS IS TEMPORARY", // https://github.com/expressjs/session#secret
  cookie: {},
  genid: () => randomUUID(),
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionConfig.cookie = {
    ...(sessionConfig.cookie ?? {}),
    secure: true // serve secure cookies
  };
}

app.use(session(sessionConfig));

app.use("/api", apiRouter);

/*
Default handler for pages in the views/pages directory

If the slug is not already handled by another route, it will be automatically
handled by this route

This route will render the page with only res.locals.pageData
*/
app.use(templateRouter);

app.use((req, res, next) => {
  next(new createHttpError.NotFound());
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`DB Server listening on port ${port}`);
});
