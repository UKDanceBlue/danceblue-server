import {
  EventResource,
  createdResponseFrom,
  okResponseFrom,
  paginatedResponseFrom,
} from "@ukdanceblue/db-app-common";
import express from "express";

import { EventIntermediate, EventModel } from "../../.././models/Event.js";
import {
  sendNotFound,
  sendValidationError,
} from "../../../actions/SendCustomError.js";
import {
  createEventFrom,
  editEventFrom,
  listEvents,
} from "../../../controllers/EventController.js";
import { notFound } from "../../../lib/expressHandlers.js";
import { sendResponse } from "../../../lib/sendResponse.js";
import {
  parseCreateEventBody,
  parseEditEventBody,
  parseListEventsQuery,
  parseSingleEventParams,
} from "../../../validation/Event.js";
const eventApiRouter = express.Router();

// Create a new event
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

  return sendResponse(
    res,
    req,
    createdResponseFrom({ id: createdEvent.uuid }),
    201
  );
});

// Get an event by ID
eventApiRouter.get("/:eventId", async (req, res) => {
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
});

// List all events
eventApiRouter.get("/", async (req, res) => {
  const query = parseListEventsQuery(req.query);

  const events = await listEvents(query);

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
});

// Edit an event
eventApiRouter.post("/:eventId", async (req, res) => {
  const { eventId } = parseSingleEventParams(req.params);

  let editEvent;
  try {
    editEvent = parseEditEventBody(req.body);
  } catch (error) {
    return sendValidationError(res, error);
  }

  let editedEvent;
  try {
    editedEvent = await editEventFrom(eventId, editEvent);
  } catch (error) {
    return sendValidationError(res, error);
  }

  return sendResponse(
    res,
    req,
    okResponseFrom({
      value: new EventIntermediate(editedEvent).toResource().serialize(),
    })
  );
});

eventApiRouter.all("*", notFound);

export default eventApiRouter;
