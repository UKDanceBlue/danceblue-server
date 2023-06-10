import {
  EventResource,
  paginatedResponseFrom,
} from "@ukdanceblue/db-app-common";
import type { Request, Response } from "express";

import { EventIntermediate, EventModel } from "../../.././models/Event.js";
import { eventResourceToModelKeyMapping } from "../../../controllers/EventController.js";
import { makeListOptions } from "../../../lib/dbHelpers/list.js";
import { sendResponse } from "../../../lib/sendResponse.js";
import { parseListEventsQuery } from "../../../validation/Event.js";

export const listEvents = async (req: Request, res: Response) => {
  const query = parseListEventsQuery(req.query);
  const options = makeListOptions<EventResource, EventModel, EventIntermediate>(
    query,
    eventResourceToModelKeyMapping
  );

  const events = await EventModel.findAndCountAll(options);

  const response = paginatedResponseFrom({
    value: EventResource.serializeArray(
      events.rows.map((e) => new EventIntermediate(e).toResource())
    ),
    pagination: {
      total: events.count,
      page: query.page,
      pageSize: query.pageSize,
    },
  });
  return sendResponse(res, req, response);
};
