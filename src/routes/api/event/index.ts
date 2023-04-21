import { createdResponseFrom } from "@ukdanceblue/db-app-common";
import express from "express";

import { sendValidationError } from "../../../actions/SendCustomError.js";
import { createEventFrom } from "../../../controllers/EventController.js";
import { notFound } from "../../../lib/expressHandlers.js";
import { parseCreateEventBody } from "../../../validation/Event.js";
const eventApiRouter = express.Router();

eventApiRouter.post("/", async (req, res) => {
  let createEvent;
  try {
    createEvent = parseCreateEventBody(req.body);
  } catch (error) {
    return sendValidationError(res, error);
  }

  let createdEvent;
  try {
    createdEvent = await createEventFrom(createEvent);
  } catch (error) {
    return sendValidationError(res, error);
  }

  return res
    .status(201)
    .json(createdResponseFrom({ id: createdEvent.eventId }));
});

eventApiRouter.all("*", notFound);

export default eventApiRouter;
