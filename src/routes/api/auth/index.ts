import { randomUUID } from "crypto";

import express from "express";
import session, { SessionOptions } from "express-session";
import createHttpError from "http-errors";
import jsonwebtoken from "jsonwebtoken";
import { Issuer, generators } from "openid-client";

import { appDataSource } from "../../../data-source.js";
import { Person } from "../../../entity/Person.js";
import { AuthSource, findPersonForLogin, makeUserJwt } from "../../../lib/auth.js";
import { requireEnvs } from "../../../lib/envutils.js";
import { NYI, notFound } from "../../../lib/expressHandlers.js";
import { destroySessionAsync, saveSessionAsync } from "../../../lib/session.js";

const authApiRouter = express.Router();

if (!process.env.COOKIE_SECRET) {
  console.error("Missing COOKIE_SECRET environment variable");
  process.exit(1);
}

const sessionConfig: SessionOptions = {
  secret: process.env.COOKIE_SECRET, // https://github.com/expressjs/session#secret
  cookie: { path: "/api/auth", secure: true },
  genid: () => randomUUID(),
};

authApiRouter.use(session(sessionConfig));

authApiRouter.use(async (req, res, next) => {
  try {
    if (!res.locals.oidcClient) {
      const envs = requireEnvs({
        MS_OIDC_URL: process.env.MS_OIDC_URL,
        MS_CLIENT_ID: process.env.MS_CLIENT_ID,
        MS_CLIENT_SECRET: process.env.MS_CLIENT_SECRET,
      }, next);

      if (!envs) {
        return;
      }
      const {
        MS_CLIENT_ID, MS_CLIENT_SECRET, MS_OIDC_URL
      } = envs;

      const microsoftGateway = await Issuer.discover(MS_OIDC_URL);
      res.locals.oidcClient = new microsoftGateway.Client({
        client_id: MS_CLIENT_ID,
        client_secret: MS_CLIENT_SECRET,
        redirect_uris: [new URL("/api/auth/oidc-callback", res.locals.applicationUrl).toString()],
        response_types: ["code"],
      });
    }
    return next();
  } catch (err) {
    return next(err);
  }
});

authApiRouter.get("/logout", async (req, res) => {
  await destroySessionAsync(req);
  res.clearCookie("token");
  res.redirect("/");
});

authApiRouter.post("/oidc-callback", async (req, res, next) => {
  try {
    if (!res.locals.oidcClient) {
      return next(createHttpError.InternalServerError("Missing OIDC client"));
    }
    console.log(req.session);
    if (!req.session.codeVerifier) {
      return next(createHttpError.InternalServerError("Missing codeVerifier"));
    }

    // Perform OIDC validation
    const params = res.locals.oidcClient.callbackParams(req);
    const tokenSet = await res.locals.oidcClient.callback(new URL("/api/auth/oidc-callback", res.locals.applicationUrl).toString(), params, { code_verifier: req.session.codeVerifier });
    
    // Clear the codeVerifier and then load the auth info
    delete req.session.codeVerifier;
    await saveSessionAsync(req);

    if (!tokenSet.access_token) {
      return next(createHttpError.InternalServerError("Missing access token"));
    }

    const {
      oid: objectId, email
    } = tokenSet.claims();
    const decodedJwt = jsonwebtoken.decode(tokenSet.access_token, { json: true });
    if (!decodedJwt) {
      return next(createHttpError.InternalServerError("Error decoding JWT"));
    }
    const {
      given_name: firstName, family_name: lastName, upn: userPrincipalName
    } = decodedJwt;

    let linkblue = null;
    if (typeof userPrincipalName === "string" && userPrincipalName.endsWith("@uky.edu")) {
      linkblue = userPrincipalName.replace(/@uky\.edu$/, "");
    }

    if (typeof objectId !== "string") {
      return next(createHttpError.InternalServerError("Missing OID"));
    }
    
    const personRepository = appDataSource.getRepository(Person);
    const [ currentPerson, didCreate ] = await findPersonForLogin(personRepository, { [AuthSource.UkyLinkblue]: objectId }, { email, linkblue });
    let isPersonChanged = didCreate;
    
    if (currentPerson.authIds[AuthSource.UkyLinkblue] !== objectId) {
      currentPerson.authIds[AuthSource.UkyLinkblue] = objectId;
      isPersonChanged = true;
    }
    if (email && currentPerson.email !== email) {
      currentPerson.email = email;
      isPersonChanged = true;
    }
    if (typeof firstName === "string" && currentPerson.firstName !== firstName) {
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
      await personRepository.save(currentPerson);
    }

    const userData = currentPerson.toUser();
    res.locals = {
      ...res.locals,
      user: userData,
    };
    const jwt = makeUserJwt(userData);
    res.cookie("token", jwt, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.redirect("/");
  } catch (err) {
    return next(err);
  }
});

authApiRouter.get("/login", async (req, res, next) => {
  try {
    req.session.codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(req.session.codeVerifier);
    await saveSessionAsync(req);

    if (!res.locals.oidcClient) {
      return next(createHttpError.InternalServerError("Missing OIDC client"));
    }

    return res.redirect(res.locals.oidcClient.authorizationUrl({
      scope: "openid email profile offline_access User.read",
      response_mode: "form_post",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    }));
  } catch (err) {
    return next(err);
  }
});

authApiRouter.all("*", notFound);

export default authApiRouter;
