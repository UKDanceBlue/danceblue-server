import { okResponseFrom } from "@ukdanceblue/db-app-common";
import type { Request, Response } from "express";

import { EventIntermediate, EventModel } from "../../.././models/Event.js";
import { sendNotFound } from "../../../actions/SendCustomError.js";
import { sendResponse } from "../../../lib/sendResponse.js";
import { parseSingleEventParams } from "../../../validation/Event.js";

export const getEvent = async (req: Request, res: Response) => {
  const { eventId } = parseSingleEventParams(req.params);

  const event = await EventModel.findOne({ where: { uuid: eventId } });

  if (!event) {
    return sendNotFound(res, "Event");
  } else {
    const response = okResponseFrom({
      value: new EventIntermediate(event).toResource().serialize(),
    });
    return sendResponse(res, req, response);
  }
};
