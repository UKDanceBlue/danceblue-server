import type { InferCreationAttributes } from "@sequelize/core";
import { AuthSource } from "@ukdanceblue/db-app-common";
import dotenv from "dotenv";
import express from "express";
import createHttpError from "http-errors";
import jsonwebtoken from "jsonwebtoken";
import { Issuer } from "openid-client";

import { logout } from "../../../actions/auth.js";
import { findPersonForLogin } from "../../../controllers/PersonController.js";
import { makeUserJwt } from "../../../lib/auth/index.js";
import { notFound } from "../../../lib/expressHandlers.js";
import { LoginFlowSessionModel } from "../../../models/LoginFlowSession.js";

const authApiRouter = express.Router();

dotenv.config();

if (!process.env.MS_OIDC_URL) {
  throw new Error("Missing MS_OIDC_URL environment variable");
}
if (!process.env.MS_CLIENT_ID) {
  throw new Error("Missing MS_CLIENT_ID environment variable");
}
if (!process.env.MS_CLIENT_SECRET) {
  throw new Error("Missing MS_CLIENT_SECRET environment variable");
}

authApiRouter.use(async (req, res, next) => {
  try {
    if (!res.locals.oidcClient) {
      const microsoftGateway = await Issuer.discover(
        process.env.MS_OIDC_URL ?? ""
      );
      res.locals.oidcClient = new microsoftGateway.Client({
        client_id: process.env.MS_CLIENT_ID ?? "",
        client_secret: process.env.MS_CLIENT_SECRET ?? "",
        redirect_uris: [
          new URL(
            "/api/auth/oidc-callback",
            res.locals.applicationUrl
          ).toString(),
        ],
        response_types: ["code"],
      });
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

authApiRouter.get("/logout", (req, res) => {
  logout(req, res);
  res.redirect("/");
});

// eslint-disable-next-line @typescript-eslint/require-await
authApiRouter.post("/oidc-callback", async (req, res, next) => {
  if (!res.locals.oidcClient) {
    throw new createHttpError.InternalServerError("Missing OIDC client");
  }

  const parameters = res.locals.oidcClient.callbackParams(req);
  const flowSessionId = parameters.state;

  if (flowSessionId == null) {
    return next(createHttpError.BadRequest());
  }

  let sessionDeleted = false;

  try {
    const session = await LoginFlowSessionModel.findOne({
      where: {
        sessionId: flowSessionId,
      },
    });
    if (!session?.codeVerifier) {
      throw new createHttpError.InternalServerError(
        `No ${session == null ? "session" : "codeVerifier"} found`
      );
    }
    // Perform OIDC validation
    const tokenSet = await res.locals.oidcClient.callback(
      new URL("/api/auth/oidc-callback", res.locals.applicationUrl).toString(),
      parameters,
      { code_verifier: session.codeVerifier, state: flowSessionId }
    );
    // Destroy the session
    await session.destroy();
    sessionDeleted = true;
    if (!tokenSet.access_token) {
      throw new createHttpError.InternalServerError("Missing access token");
    }
    const { oid: objectId, email } = tokenSet.claims();
    const decodedJwt = jsonwebtoken.decode(tokenSet.access_token, {
      json: true,
    });
    if (!decodedJwt) {
      throw new createHttpError.InternalServerError("Error decoding JWT");
    }
    const {
      given_name: firstName,
      family_name: lastName,
      upn: userPrincipalName,
    } = decodedJwt;
    let linkblue = null;
    if (
      typeof userPrincipalName === "string" &&
      userPrincipalName.endsWith("@uky.edu")
    ) {
      linkblue = userPrincipalName.replace(/@uky\.edu$/, "");
    }
    if (typeof objectId !== "string") {
      return next(createHttpError.InternalServerError("Missing OID"));
    }
    const [currentPerson, didCreate] = await findPersonForLogin(
      { [AuthSource.UkyLinkblue]: objectId },
      { email, linkblue }
    );
    let isPersonChanged = didCreate;
    if (currentPerson.authIds[AuthSource.UkyLinkblue] !== objectId) {
      currentPerson.authIds[AuthSource.UkyLinkblue] = objectId;
      isPersonChanged = true;
    }
    if (email && currentPerson.email !== email) {
      currentPerson.email = email;
      isPersonChanged = true;
    }
    if (
      typeof firstName === "string" &&
      currentPerson.firstName !== firstName
    ) {
      currentPerson.firstName = firstName;
      isPersonChanged = true;
    }
    if (typeof lastName === "string" && currentPerson.lastName !== lastName) {
      currentPerson.lastName = lastName;
      isPersonChanged = true;
    }
    if (linkblue && currentPerson.linkblue !== linkblue) {
      currentPerson.linkblue = linkblue;
      isPersonChanged = true;
    }
    if (isPersonChanged) {
      await currentPerson.save();
    }
    const userData = currentPerson.toUserData();
    res.locals = {
      ...res.locals,
      user: userData,
    };
    const jwt = makeUserJwt(userData, AuthSource.UkyLinkblue);
    res.cookie("token", jwt, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    return res.redirect(session.redirectToAfterLogin ?? "/");
  } catch (error) {
    if (!sessionDeleted) {
      // const sessionRepository = appDataSource.getRepository(LoginFlowSession);
      // sessionRepository.delete({ sessionId: flowSessionId }).catch(logCritical);
    }
    return next(error);
  }
});

// eslint-disable-next-line @typescript-eslint/require-await
authApiRouter.get("/login", async (req, res, next) => {
  try {
    if (!res.locals.oidcClient) {
      return next(createHttpError.InternalServerError("Missing OIDC client"));
    }

    // Figure out where to redirect to after login
    const loginFlowSessionInitializer: Partial<
      InferCreationAttributes<LoginFlowSessionModel>
    > = {};
    const { host: hostHeader, referer: hostReferer } = req.headers;
    const host = hostHeader
      ? new URL(`https://${hostHeader}`).host
      : res.locals.applicationUrl.host;
    if (hostReferer && hostReferer.length > 0) {
      const referer = new URL(hostReferer);
      if (referer.host === host) {
        loginFlowSessionInitializer.redirectToAfterLogin = referer.pathname;
      }
    }

    // const sessionRepository = appDataSource.getRepository(LoginFlowSession);
    // const session = await sessionRepository.save(
    //   sessionRepository.create(loginFlowSessionInitializer)
    // );

    // const codeChallenge = generators.codeChallenge(session.codeVerifier);

    return res.redirect(
      res.locals.oidcClient.authorizationUrl({
        scope: "openid email profile offline_access User.read",
        response_mode: "form_post",
        // code_challenge: codeChallenge,
        code_challenge_method: "S256",
        // state: session.sessionId,
      })
    );
  } catch (error) {
    return next(error);
  }
});

authApiRouter.all("*", notFound);

export default authApiRouter;
