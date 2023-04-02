import express from "express";
import createHttpError from "http-errors";

import { AccessLevel } from "../../lib/auth.js";

import adminApiRouter from "./admin/index.js";
import authApiRouter from "./auth/index.js";
import configurationApiRouter from "./configuration/index.js";
import eventApiRouter from "./event/index.js";
import moraleApiRouter from "./morale/index.js";
import spiritApiRouter from "./spirit/index.js";
import userApiRouter from "./user/index.js";

const apiRouter = express.Router();

// No authentication required
apiRouter.use("/coniguration", configurationApiRouter);
apiRouter.use("/auth", authApiRouter);

// Authentication required
apiRouter.use((req, res, next) => {
  if (res.locals.authorization.accessLevel <= AccessLevel.None) {
    const unauthorizedError = new createHttpError.Unauthorized();
    // TODO set the WWW-Authenticate header
    unauthorizedError.expose = false;
    return next(unauthorizedError);
  } else {
    next();
  }
});

apiRouter.use("/event", eventApiRouter);
apiRouter.use("/spirit", spiritApiRouter);
apiRouter.use("/morale", moraleApiRouter);

// Authorization required (team member)
apiRouter.use((req, res, next) => {
  if (res.locals.authorization.accessLevel < AccessLevel.TeamMember) {
    const forbiddenError = new createHttpError.Forbidden();
    forbiddenError.expose = false;
    return next(forbiddenError);
  } else {
    next();
  }
});

apiRouter.use("/user", userApiRouter);

// Authorization required (committee)
apiRouter.use((req, res, next) => {
  const { accessLevel } = res.locals.authorization;
  if (accessLevel < AccessLevel.CommitteeChairOrCoordinator) {
    const forbiddenError = new createHttpError.Forbidden();
    forbiddenError.expose = false;
    return next(forbiddenError);
  } else {
    next();
  }
});

apiRouter.use("/admin", adminApiRouter);

export default apiRouter;
