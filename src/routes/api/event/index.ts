import {
  EventResource,
  createdResponseFrom,
  okResponseFrom,
  paginatedResponseFrom,
} from "@ukdanceblue/db-app-common";
import express from "express";

import { EventModel } from "../../.././models/Event.js";
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

  return res
    .status(201)
    .json(createdResponseFrom({ id: createdEvent.eventId }));
});

// Get an event by ID
eventApiRouter.get("/:eventId", async (req, res) => {
  const { eventId } = parseSingleEventParams(req.params);

  const event = await EventModel.findOne({ where: { eventId } });

  if (!event) {
    return sendNotFound(res, "Event");
  } else {
    const response = okResponseFrom({ value: event.toResource().serialize() });

    return res.status(200).json(response);
  }
});

// List all events
eventApiRouter.get("/", async (req, res) => {
  const query = parseListEventsQuery(req.query);

  const events = await listEvents(query);

  const response = paginatedResponseFrom({
    value: EventResource.serializeArray(events.rows.map((e) => e.toResource())),
    pagination: {
      total: events.count,
      page: query.page,
      pageSize: query.pageSize,
    },
  });

  return res.status(200).json(response);
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

  return res
    .status(200)
    .json(okResponseFrom({ value: editedEvent.toResource().serialize() }));
});

eventApiRouter.all("*", notFound);

export default eventApiRouter;
