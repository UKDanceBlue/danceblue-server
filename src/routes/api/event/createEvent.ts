import { createdResponseFrom } from "@ukdanceblue/db-app-common";
import type { Request, Response } from "express";

import { EventModel } from "../../.././models/Event.js";
import { sendValidationError } from "../../../actions/SendCustomError.js";
import { sendResponse } from "../../../lib/sendResponse.js";
import { logDebug } from "../../../logger.js";
import { parseCreateEventBody } from "../../../validation/Event.js";

export const createEvent = async (req: Request, res: Response) => {
  let createEvent;
  try {
    createEvent = parseCreateEventBody(req.body);
  } catch (error) {
    return sendValidationError(res, error);
  }

  let createdEvent;
  try {
    createdEvent = EventModel.build({
      title: createEvent.title,
    });

    // TODO: generalize this
    if (createEvent.summary !== undefined)
      createdEvent.summary = createEvent.summary;
    if (createEvent.description !== undefined)
      createdEvent.description = createEvent.description;
    if (createEvent.location !== undefined)
      createdEvent.location = createEvent.location;
    createdEvent.occurrences = createEvent.occurrences.map((dateTime) =>
      dateTime.toJSDate()
    );
    if (createEvent.duration !== undefined)
      createdEvent.duration = createEvent.duration;

    createdEvent = await createdEvent.save();

    logDebug(`Created event: ${createdEvent.uuid}`, createdEvent);
  } catch (error) {
    return sendValidationError(res, error);
  }

  return sendResponse(
    res,
    req,
    createdResponseFrom({ id: createdEvent.uuid }),
    201
  );
};
