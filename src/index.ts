import { resolve } from "path";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import createHttpError from "http-errors";
import jsonwebtoken from "jsonwebtoken";

import { logout } from "./actions/auth.js";
import { appDataSource } from "./data-source.js";
import {
  UserData,
  defaultUserData,
  parseUserJwt,
  tokenFromRequest,
} from "./lib/auth.js";
import { errorHandler } from "./lib/errorhandler.js";
import { notFound } from "./lib/expressHandlers.js";
import apiRouter from "./routes/api/index.js";
import templateRouter from "./routes/template.js";

if (!process.env.APPLICATION_PORT) {
  console.error("Missing APPLICATION_PORT environment variable");
  process.exit(1);
}
const port = parseInt(process.env.APPLICATION_PORT, 10);
if (!process.env.APPLICATION_HOST) {
  console.error("Missing APPLICATION_HOST environment variable");
  process.exit(1);
}
const FAKE_APP_URL: URL = new URL(`https://${process.env.APPLICATION_HOST}`);
FAKE_APP_URL.port = port.toString();

await appDataSource.initialize();

const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.set("view engine", "ejs");
app.set("views", resolve("views/pages"));

app.use((req, res, next) => {
  res.locals.pageData = {};
  res.locals.applicationUrl = new URL("", FAKE_APP_URL);
  res.locals.applicationUrl.protocol = req.protocol;

  return next();
});

app.use((req, res, next) => {
  const [token, tokenError] = tokenFromRequest(req);
  switch (tokenError) {
    case "invalid-header": {
      return next(
        new createHttpError.BadRequest("Invalid Authorization header")
      );
    }
    case "not-bearer": {
      const notBearerError = new createHttpError.BadRequest(
        "Authorization header must be a Bearer token"
      );
      notBearerError.headers = { "WWW-Authenticate": "Bearer" };
      return next(notBearerError);
    }
    default:
      break;
  }

  let error: unknown;
  let userData: UserData | undefined = undefined;
  if (token) {
    try {
      userData = parseUserJwt(token);
    } catch (err) {
      logout(req, res);
      if (err instanceof jsonwebtoken.TokenExpiredError) {
        // Do nothing
      } else if (err instanceof jsonwebtoken.NotBeforeError) {
        const httpError = new createHttpError.Unauthorized(err.message);
        if (err.stack) {
          httpError.stack = err.stack;
        }
        error = httpError;
      } else if (err instanceof jsonwebtoken.JsonWebTokenError) {
        const httpError = new createHttpError.Unauthorized(err.message);
        if (err.stack) {
          httpError.stack = err.stack;
        }
        error = httpError;
      } else {
        error = err;
      }
    }
  }

  res.locals.userData = userData ?? defaultUserData;
  if (error) {
    return next(error);
  } else {
    return next();
  }
});

app.all("/printer", (req, res) => {
  console.log("Request details:");
  console.log("Method: %s", req.method);
  console.log("Method: %s", req.url);
  console.log("Query: %s", req.query);
  console.log("Params: %s", req.params);
  console.log("Body: %s", req.body);
  res.status(200).send();
});

app.use("/api", apiRouter);

/*
Default handler for pages in the views/pages directory

If the slug is not already handled by another route, it will be automatically
handled by this route

This route will render the page with only res.locals.pageData
*/
app.use(templateRouter);

app.all("*", notFound);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`DB Server listening on port ${port}`);
});
