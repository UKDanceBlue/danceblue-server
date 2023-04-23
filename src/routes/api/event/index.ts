import {
  createdResponseFrom,
  okResponseFrom,
} from "@ukdanceblue/db-app-common";
import express from "express";

import {
  sendNotFound,
  sendValidationError,
} from "../../../actions/SendCustomError.js";
import {
  EventRepository,
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

  const event = await EventRepository.findByEventId(eventId);

  if (!event) {
    return sendNotFound(res, "Event");
  } else {
    const response = okResponseFrom({ value: event });

    return res.status(200).json(response);
  }
});

// List all events
eventApiRouter.get("/", async (req, res) => {
  const query = parseListEventsQuery(req.query);

  const events = await listEvents(query);

  const response = okResponseFrom({ value: events });

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

  return res.status(200).json(okResponseFrom({ value: editedEvent }));
});

eventApiRouter.all("*", notFound);

export default eventApiRouter;
