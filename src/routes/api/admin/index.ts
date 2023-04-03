import express from "express";

import { notFound } from "../../../lib/expressHandlers.js";
const adminApiRouter = express.Router();

adminApiRouter.all("*", notFound);

export default adminApiRouter;
