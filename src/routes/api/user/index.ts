import express from "express";

import { notFound } from "../../../lib/expressHandlers.js";
const userApiRouter = express.Router();

userApiRouter.all("*", notFound);

export default userApiRouter;
