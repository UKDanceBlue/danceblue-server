import type {
  EventResource,
  EventResourceInitializer,
  ListEventsQuery,
} from "@ukdanceblue/db-app-common";

import type { EventIntermediate } from ".././models/Event.js";
import { EventModel } from ".././models/Event.js";
import type { ResourceToModelKeyMapping } from "../lib/dbHelpers/common.js";
import { makeListOptions } from "../lib/dbHelpers/list.js";
import { logDebug } from "../logger.js";

const eventResourceToModelKeyMapping: ResourceToModelKeyMapping<
  EventResource,
  EventModel,
  EventIntermediate
> = {
  eventId: "uuid",
  description: "description",
  duration: "duration",
  location: "location",
  occurrences: "occurrences",
  summary: "summary",
  title: "title",
  images: "images",
};

/**
 * Lists events based on the query parameters. If no query parameters are
 * provided, it will return all events.
 *
 * @param query - The query parameters
 * @return The list of events
 */
export async function listEvents(
  query: ListEventsQuery
): Promise<{ rows: EventModel[]; count: number }> {
  const options = makeListOptions<EventResource, EventModel, EventIntermediate>(
    query,
    eventResourceToModelKeyMapping
  );

  return EventModel.findAndCountAll(options);
}

/**
 * @param body - The body of the request
 * @return The parsed body
 */
export async function createEventFrom(
  body: Omit<EventResourceInitializer, "eventId">
): Promise<EventModel> {
  let createdEvent = EventModel.build({
    title: body.title,
  });

  // TODO: generalize this

  if (body.summary !== undefined) createdEvent.summary = body.summary;
  if (body.description !== undefined)
    createdEvent.description = body.description;
  if (body.location !== undefined) createdEvent.location = body.location;
  createdEvent.occurrences = body.occurrences;
  if (body.duration !== undefined) createdEvent.duration = body.duration;

  createdEvent = await createdEvent.save();

  logDebug(`Created event: ${createdEvent.uuid}`, createdEvent);

  return createdEvent;
}
