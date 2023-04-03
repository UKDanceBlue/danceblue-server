import express from "express";

import { notFound } from "../../../lib/expressHandlers.js";
const configurationApiRouter = express.Router();

configurationApiRouter.all("*", notFound);

export default configurationApiRouter;
