import { okResponseFrom } from "@ukdanceblue/db-app-common";
import type { Request, Response } from "express";

import { EventIntermediate, EventModel } from "../../.././models/Event.js";
import { sendNotFound } from "../../../actions/SendCustomError.js";
import { sendResponse } from "../../../lib/sendResponse.js";
import { logDebug } from "../../../logger.js";
import { EventOccurrenceModel } from "../../../models/EventOccurrence.js";
import { parseSingleEventParams } from "../../../validation/Event.js";

export const getEvent = async (req: Request, res: Response) => {
  const { eventId } = parseSingleEventParams(req.params);

  const event = await EventModel.withScope("withImages").findOne({
    where: { uuid: eventId },
    include: [
      {
        model: EventOccurrenceModel,
        as: "occurrences",
      },
    ],
  });

  if (!event) {
    return sendNotFound(res, "Event");
  } else {
    const resource = new EventIntermediate(event).toResource();
    const serializedResource = resource.serialize();
    logDebug("Serialized resource:", serializedResource);
    const response = okResponseFrom({
      value: serializedResource,
    });
    return sendResponse(res, req, response);
  }
};
