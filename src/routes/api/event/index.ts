import express from "express";

import { sendValidationError } from "../../../actions/SendCustomError.js";
import { createEventFrom } from "../../../controllers/EventController.js";
import { createdResponseFrom } from "../../../lib/JsonResponse.js";
import { notFound } from "../../../lib/expressHandlers.js";
import { parseNewEventBody } from "../../../validation/Event.js";
const eventApiRouter = express.Router();

eventApiRouter.post("/", async (req, res) => {
  let newEvent;
  try {
    newEvent = parseNewEventBody(req.body);
  } catch (error) {
    return sendValidationError(res, error);
  }

  let createdEvent;
  try {
    console.log(newEvent);
    createdEvent = await createEventFrom(newEvent);
  } catch (error) {
    return sendValidationError(res, error);
  }

  return res
    .status(201)
    .json(createdResponseFrom({ id: createdEvent.eventId }));
});

eventApiRouter.all("*", notFound);

export default eventApiRouter;
