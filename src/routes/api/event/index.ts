import express from "express";

import { notFound } from "../../../lib/expressHandlers.js";
const eventApiRouter = express.Router();

eventApiRouter.all("*", notFound);

export default eventApiRouter;
