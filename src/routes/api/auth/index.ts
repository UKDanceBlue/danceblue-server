import express from "express";
import createHttpError from "http-errors";
import { Issuer, generators } from "openid-client";
import { DataSource } from "typeorm";

import { appDataSource } from "../../../data-source.js";
import { Person } from "../../../entity/Person.js";
import { NYI } from "../../../lib/nyi.js";
const authApiRouter = express.Router();

authApiRouter.use(async (req, res, next) => {
  try {
    if (!res.locals.oidcClient) {
      if (!process.env.MS_OIDC_URL) {
        return next(createHttpError.InternalServerError("Missing environment variable MS_OIDC_URL"));
      }
      if (!process.env.MS_CLIENT_ID) {
        return next(createHttpError.InternalServerError("Missing environment variable MS_CLIENT_ID"));
      }
      const microsoftGateway = await Issuer.discover(process.env.MS_OIDC_URL);
      res.locals.oidcClient = new microsoftGateway.Client({
        client_id: process.env.MS_CLIENT_ID,
        redirect_uris: [new URL("/api/auth/oidc-callback", res.locals.applicationUrl).toString()],
        response_types: ["id_token"],
      });
    }
    return next();
  } catch (err) {
    return next(err);
  }
});

authApiRouter.post("/logout", NYI);

authApiRouter.post("/oidc-callback", async (req, res, next) => {
  try {
    console.log(req.session);
    console.log(req.body);
    if (!res.locals.oidcClient) {
      return next(createHttpError.InternalServerError("Missing OIDC client"));
    }
    if (!req.session.oidcNonce) {
      return next(createHttpError.InternalServerError("Missing nonce"));
    }

    // Perform OIDC validation
    const params = res.locals.oidcClient.callbackParams(req);
    const tokenSet = await res.locals.oidcClient.callback(new URL("/api/auth/oidc-callback", res.locals.applicationUrl).toString(), params, { nonce: req.session.oidcNonce });
    
    // Clear the nonce and then load the auth info
    delete req.session.oidcNonce;
    req.session.save(async (err) => {
      if (err) {
        return next(err);
      }

      res.write("Loading...");

      const {
        oid: objectId, email
      } = tokenSet.claims();

      if (typeof objectId !== "string") {
        return next(createHttpError.InternalServerError("Missing OID"));
      }
      
      const personRepository = appDataSource.getRepository(Person);
      let currentPerson = await personRepository.findOne({ where: { authId: objectId } });
      
      if (!currentPerson) {
        currentPerson = new Person();
        currentPerson.authId = objectId;
        if (email) {
          currentPerson.email = email;
        }
        currentPerson = await personRepository.save(currentPerson);
      }

      res.redirect("/");
    });
  } catch (err) {
    return next(err);
  }
});

authApiRouter.get("/login", (req, res, next) => {
  const nonce = generators.nonce();
  req.session.oidcNonce = nonce;
  req.session.save((err) => {
    if (err) {
      return next(err);
    }

    console.log(req.session);
    
    if (!res.locals.oidcClient) {
      return next(createHttpError.InternalServerError("Missing OIDC client"));
    }
    res.redirect(res.locals.oidcClient.authorizationUrl({
      scope: "openid email profile offline_access User.read",
      response_mode: "form_post",
      nonce,
    }));
  });
});

export default authApiRouter;
