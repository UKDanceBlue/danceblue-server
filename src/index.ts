import { resolve } from "path";


import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import createHttpError from "http-errors";
import jsonwebtoken from "jsonwebtoken";

import { appDataSource } from "./data-source.js";
import { defaultUserData, parseUserJwt, tokenFromRequest } from "./lib/auth.js";
import { errorHandler } from "./lib/errorhandler.js";
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
const url: URL = new URL(`https://${process.env.APPLICATION_HOST}`);
url.port = port.toString();

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
  const urlWithProtocol = new URL("", url);
  urlWithProtocol.protocol = req.protocol;
  res.locals.applicationUrl = urlWithProtocol;

  return next();
});

app.use((req, res, next) => {
  const [ token, tokenError ] = tokenFromRequest(req);
  switch (tokenError) {
  case "invalid-header": {
    return next(new createHttpError.BadRequest("Invalid Authorization header"));
  }
  case "not-bearer": {
    const notBearerError = new createHttpError.BadRequest("Authorization header must be a Bearer token");
    notBearerError.headers = { "WWW-Authenticate": "Bearer" };
    return next(notBearerError);
  }
  default:
    break;
  }
  if (token) {
    try {
      res.locals.userData = parseUserJwt(token);
    } catch (err) {
      if (err instanceof jsonwebtoken.JsonWebTokenError) {
        const httpError = new createHttpError.Unauthorized(err.message);
        if (err.stack) {
          httpError.stack = err.stack;
        }
        return next(httpError);
      } else if (err instanceof jsonwebtoken.TokenExpiredError) {
        const httpError = new createHttpError.Unauthorized(err.message);
        if (err.stack) {
          httpError.stack = err.stack;
        }
        return next(httpError);
      } else if (err instanceof jsonwebtoken.NotBeforeError) {
        const httpError = new createHttpError.Unauthorized(err.message);
        if (err.stack) {
          httpError.stack = err.stack;
        }
        return next(httpError);
      } else {
        return next(err);
      }
    }
  } else {
    res.locals.userData = defaultUserData();
  }
  return next();
});

app.use("/api", apiRouter);

/*
Default handler for pages in the views/pages directory

If the slug is not already handled by another route, it will be automatically
handled by this route

This route will render the page with only res.locals.pageData
*/
app.use(templateRouter);

app.use((req, res, next) => {
  return next(new createHttpError.NotFound());
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`DB Server listening on port ${port}`);
});
