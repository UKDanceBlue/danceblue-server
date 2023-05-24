import { EditType } from "@ukdanceblue/db-app-common";
import type {
  EventResource,
  EventResourceInitializer,
  ListEventsQuery,
  ParsedEditEventBody,
} from "@ukdanceblue/db-app-common";
import createHttpError from "http-errors";

import { EventModel } from ".././models/Event.js";
import { sequelizeDb } from "../data-source.js";
import type { ResourceToModelKeyMapping } from "../lib/dbHelpers/common.js";
import { makeListOptions } from "../lib/dbHelpers/list.js";
import { logDebug } from "../logger.js";

const eventResourceToModelKeyMapping: ResourceToModelKeyMapping<
  EventResource,
  EventModel
> = {
  eventId: "eventId",
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
  const options = makeListOptions<EventResource, EventModel>(
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

  logDebug(`Created event: ${createdEvent.eventId}`, createdEvent);

  return createdEvent;
}

/**
 * Uses the body of the request to edit an event. If the event is not found,
 * throws a 404 error.
 *
 * @param eventId - The ID of the event to edit
 * @param body - The body of the request
 * @return The edited event
 */
export async function editEventFrom(
  eventId: string,
  body: ParsedEditEventBody
): Promise<EventModel> {
  return sequelizeDb.transaction<EventModel>(async (transaction) => {
    // TODO: generalize this

    const originalEvent = await EventModel.findOne({
      where: { eventId },
      transaction,
    });
    if (originalEvent == null) {
      throw createHttpError.NotFound("Event not found");
    }
    if (body.type === EditType.REPLACE) {
      await originalEvent.destroy({ transaction });

      let replacementEvent = EventModel.build({
        id: originalEvent.id,
        eventId: originalEvent.eventId,
        title: body.value.title,
      });

      replacementEvent.summary = body.value.summary ?? null;
      replacementEvent.description = body.value.description ?? null;
      replacementEvent.location = body.value.location ?? null;
      replacementEvent.occurrences = body.value.occurrences;
      replacementEvent.duration = body.value.duration ?? null;

      replacementEvent = await replacementEvent.save({ transaction });

      logDebug(`Replaced event: ${replacementEvent.eventId}`);

      return replacementEvent;
    } else {
      const { location, description, occurrences, duration, summary, title } =
        body.value;

      if (title !== undefined) originalEvent.title = title;
      if (summary !== undefined) originalEvent.summary = summary;
      if (description !== undefined) originalEvent.description = description;
      if (location !== undefined) originalEvent.location = location;
      if (occurrences !== undefined) {
        switch (occurrences.type) {
          case EditType.REPLACE: {
            // originalEvent.occurrences = intervals.set.sort();
            break;
          }
          case EditType.MODIFY: {
            const newEventOccurrences = [];
            // Loop over all the existing intervals
            for (const occurrence of originalEvent.occurrences) {
              // Assume we should add the interval
              let shouldAdd = true;
              // Loop over all the intervals to remove
              for (const occurenceToModify of occurrences.remove) {
                // If the occurence is in the list of occurrences to remove, don't add it
                if (occurrence.equals(occurenceToModify)) {
                  shouldAdd = false;
                  break;
                }
              }
              // IF we didn't find the interval in the list of intervals to remove, add it to the new list
              if (shouldAdd) newEventOccurrences.push(occurrence);
            }
            for (const interval of occurrences.add) {
              // Add all the intervals to add
              newEventOccurrences.push(interval);
            }
            break;
          }
        }
      }
      if (duration !== undefined) originalEvent.duration = duration;

      const modifiedEvent = await originalEvent.save({ transaction });

      logDebug(`Edited event: ${modifiedEvent.eventId}`, modifiedEvent);

      return modifiedEvent;
    }
  });
}
