import type { Server } from "node:http";
import { resolve } from "node:path";

import type { UserData } from "@ukdanceblue/db-app-common";
import { AccessLevel, CommitteeRole, DbRole } from "@ukdanceblue/db-app-common";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import createHttpError from "http-errors";
import jsonwebtoken from "jsonwebtoken";

import { logout } from "./actions/auth.js";
import {
  defaultUserData,
  parseUserJwt,
  tokenFromRequest,
} from "./lib/auth/index.js";
import { errorHandler } from "./lib/errorhandler.js";
import { notFound } from "./lib/expressHandlers.js";
import rawLogger, { logCritical, logInfo } from "./logger.js";
import apiRouter from "./routes/api/index.js";
import templateRouter from "./routes/template.js";

if (!process.env.APPLICATION_PORT) {
  logCritical("Missing APPLICATION_PORT environment variable");
  process.exit(1);
}
const port = Number.parseInt(process.env.APPLICATION_PORT, 10);
if (!process.env.APPLICATION_HOST) {
  logCritical("Missing APPLICATION_HOST environment variable");
  process.exit(1);
}
const FAKE_APP_URL: URL = new URL(`https://${process.env.APPLICATION_HOST}`);
FAKE_APP_URL.port = port.toString();

const app = express();

app.use(express.static("public"));
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
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
  if (process.env.OVERRIDE_AUTH === "THIS IS DANGEROUS") {
    res.locals.userData = {
      auth: {
        accessLevel: AccessLevel.Admin,
        dbRole: DbRole.Committee,
        committeeRole: CommitteeRole.Chair,
      },
      userId: "00000000-0000-0000-0000-000000000000",
    };
    return next();
  }

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
    default: {
      break;
    }
  }

  let error: unknown;
  let userData: UserData | undefined = undefined;
  if (token) {
    try {
      userData = parseUserJwt(token);
    } catch (error_) {
      logout(req, res);
      if (error_ instanceof jsonwebtoken.TokenExpiredError) {
        // Do nothing
      } else if (error_ instanceof jsonwebtoken.NotBeforeError) {
        const httpError = new createHttpError.Unauthorized(error_.message);
        if (error_.stack) {
          httpError.stack = error_.stack;
        }
        error = httpError;
      } else if (error_ instanceof jsonwebtoken.JsonWebTokenError) {
        const httpError = new createHttpError.Unauthorized(error_.message);
        if (error_.stack) {
          httpError.stack = error_.stack;
        }
        error = httpError;
      } else {
        error = error_;
      }
    }
  }

  res.locals.userData = userData ?? defaultUserData;
  return error ? next(error) : next();
});

app.all("/printer", (req, res) => {
  logInfo("Request details:");
  logInfo("Method: %s", req.method);
  logInfo("Method: %s", req.url);
  logInfo(
    "Query: %s",
    Array.isArray(req.query) ? req.query.join(", ") : String(req.query)
  );
  logInfo(
    "Params: %s",
    Array.isArray(req.params) ? req.params.join(", ") : String(req.params)
  );
  logInfo("Body: %s", JSON.stringify(req.body));
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

// eslint-disable-next-line prefer-const
let httpServer: Server;

/**
 * This function will kill the server and exit the process
 * it sets the exit code to 1, indicating an error
 *
 * @param beforeExit - A function to run before exiting (warning, exceptions will be ignored)
 * @param code - The exit code to use
 */
export function stopServer(
  beforeExit?: (() => void) | null | undefined,
  code = 1
) {
  rawLogger.on("finish", () => {
    try {
      beforeExit?.();
    } catch {
      // Ignore exceptions
    }
    httpServer.close(() => {
      process.exit(code);
    });
  });
  logInfo("Stopping server");
  rawLogger.end();
}

process.on("SIGINT", () => {
  stopServer();
});

httpServer = app.listen(port, () => {
  logInfo(`DB Server listening on port ${port}`);
});
