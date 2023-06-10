import express from "express";

import { notFound } from "../../../lib/expressHandlers.js";

import { createEvent } from "./createEvent.js";
import { getEvent } from "./getEvent.js";
import { listEvents } from "./listEvents.js";
const eventApiRouter = express.Router();

// Create a new event
eventApiRouter.post("/", createEvent);

// Get an event by ID
eventApiRouter.get("/:eventId", getEvent);

// List all events
eventApiRouter.get("/", listEvents);

eventApiRouter.all("*", notFound);

export default eventApiRouter;
