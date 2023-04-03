import express from "express";

import { notFound } from "../../../lib/expressHandlers.js";
const moraleApiRouter = express.Router();

moraleApiRouter.all("*", notFound);

export default moraleApiRouter;
