import express from "express";

import { notFound } from "../../../lib/expressHandlers.js";
const spiritApiRouter = express.Router();

spiritApiRouter.all("*", notFound);

export default spiritApiRouter;
