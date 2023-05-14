import { EditType } from "@ukdanceblue/db-app-common";
import type {
  EventResource,
  ListEventsQuery,
  ParsedCreateEventBody,
  ParsedEditEventBody,
} from "@ukdanceblue/db-app-common";
import createHttpError from "http-errors";

import { sequelizeDb } from "../data-source.js";
import type { ResourceToModelKeyMapping } from "../lib/dbHelpers/common.js";
import { makeListOptions } from "../lib/dbHelpers/list.js";
import { logDebug } from "../logger.js";
import { EventModel } from "../models/Event.js";

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
  body: ParsedCreateEventBody
): Promise<EventModel> {
  let createdEvent = EventModel.build({
    title: body.eventTitle,
  });

  // TODO: generalize this

  if (body.eventSummary !== undefined) createdEvent.summary = body.eventSummary;
  if (body.eventDescription !== undefined)
    createdEvent.description = body.eventDescription;
  if (body.eventAddress !== undefined)
    createdEvent.location = body.eventAddress;
  createdEvent.occurrences = body.eventOccurrences;
  if (body.eventDuration !== undefined)
    createdEvent.duration = body.eventDuration;

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
        title: body.value.eventTitle,
      });

      if (body.value.eventSummary !== undefined)
        replacementEvent.summary = body.value.eventSummary;
      if (body.value.eventDescription !== undefined)
        replacementEvent.description = body.value.eventDescription;
      if (body.value.eventAddress !== undefined)
        replacementEvent.location = body.value.eventAddress;
      replacementEvent.occurrences = body.value.eventOccurrences;
      if (body.value.eventDuration !== undefined)
        replacementEvent.duration = body.value.eventDuration;

      replacementEvent = await replacementEvent.save({ transaction });

      logDebug(`Replaced event: ${replacementEvent.eventId}`);

      return replacementEvent;
    } else {
      const {
        eventAddress,
        eventDescription,
        eventOccurrences,
        eventDuration,
        eventSummary,
        eventTitle,
      } = body.value;

      if (eventTitle !== undefined) originalEvent.title = eventTitle;
      if (eventSummary !== undefined) originalEvent.summary = eventSummary;
      if (eventDescription !== undefined)
        originalEvent.description = eventDescription;
      if (eventAddress !== undefined) originalEvent.location = eventAddress;
      if (eventOccurrences !== undefined) {
        switch (eventOccurrences.type) {
          case EditType.REPLACE: {
            // originalEvent.occurrences = eventIntervals.set.sort();
            break;
          }
          case EditType.MODIFY: {
            const newEventOccurrences = [];
            // Loop over all the existing intervals
            for (const occurrence of originalEvent.occurrences) {
              // Assume we should add the interval
              let shouldAdd = true;
              // Loop over all the intervals to remove
              for (const occurenceToModify of eventOccurrences.remove) {
                // If the occurence is in the list of occurrences to remove, don't add it
                if (occurrence.equals(occurenceToModify)) {
                  shouldAdd = false;
                  break;
                }
              }
              // IF we didn't find the interval in the list of intervals to remove, add it to the new list
              if (shouldAdd) newEventOccurrences.push(occurrence);
            }
            for (const interval of eventOccurrences.add) {
              // Add all the intervals to add
              newEventOccurrences.push(interval);
            }
            break;
          }
        }
      }
      if (eventDuration !== undefined) originalEvent.duration = eventDuration;

      const modifiedEvent = await originalEvent.save({ transaction });

      logDebug(`Edited event: ${modifiedEvent.eventId}`, modifiedEvent);

      return modifiedEvent;
    }
  });
}
