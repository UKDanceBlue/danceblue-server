import type {
  ListEventsQuery,
  ParsedCreateEventBody,
  ParsedEditEventBody,
} from "@ukdanceblue/db-app-common";
import { EditType } from "@ukdanceblue/db-app-common";
import createHttpError from "http-errors";

import { appDataSource } from "../data-source.js";
import { Event } from "../entity/Event.js";
import { logDebug } from "../logger.js";

export const EventRepository = appDataSource.getRepository(Event).extend({
  findByEventId(eventId: string) {
    return this.findOneBy({ eventId });
  },
  deleteByEventId(eventId: string) {
    return this.softRemove({ eventId });
  },
  makeEvent(
    data: ParsedCreateEventBody,
    id?: number,
    eventId?: string
  ): Promise<Event> {
    const createdEvent = new Event();
    if (id) createdEvent.id = id;
    if (eventId) createdEvent.eventId = eventId;

    createdEvent.title = data.eventTitle;
    if (data.eventSummary != null) createdEvent.summary = data.eventSummary;
    if (data.eventDescription != null)
      createdEvent.description = data.eventDescription;
    if (data.eventAddress != null) createdEvent.location = data.eventAddress;
    if (data.eventIntervals.length > 0)
      createdEvent.occurrences = data.eventIntervals;
    // TODO: Add images

    return this.save(createdEvent);
  },
});

/**
 * Lists events based on the query parameters. If no query parameters are
 * provided, it will return all events.
 *
 * @param query - The query parameters
 * @return The list of events
 */
export async function listEvents(query: ListEventsQuery): Promise<Event[]> {
  const { page, pageSize, sortBy, sortDirection } = query;

  return EventRepository.find({
    skip: page * pageSize,
    take: pageSize,
    order: {
      [sortBy]: sortDirection,
    },
  });
}

/**
 * @param body - The body of the request
 * @return The parsed body
 */
export async function createEventFrom(
  body: ParsedCreateEventBody
): Promise<Event> {
  const createdEvent = await EventRepository.makeEvent(body);

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
): Promise<Event> {
  return appDataSource.transaction(async (entityManager) => {
    const transaction = entityManager.withRepository(EventRepository);

    const originalEvent = await transaction.findByEventId(eventId);
    if (originalEvent == null) {
      throw createHttpError.NotFound("Event not found");
    }
    if (body.type === EditType.REPLACE) {
      await transaction.remove(originalEvent);

      const replacementEvent = await transaction.makeEvent(
        body.value,
        originalEvent.id,
        originalEvent.eventId
      );

      logDebug(`Created event: ${replacementEvent.eventId}`, replacementEvent);

      return replacementEvent;
    } else {
      const {
        eventAddress,
        eventDescription,
        eventIntervals,
        eventSummary,
        eventTitle,
      } = body.value;
      if (eventTitle !== undefined) originalEvent.title = eventTitle;
      if (eventSummary !== undefined) originalEvent.summary = eventSummary;
      if (eventDescription !== undefined)
        originalEvent.description = eventDescription;
      if (eventAddress !== undefined) originalEvent.location = eventAddress;
      if (eventIntervals !== undefined) {
        switch (eventIntervals.type) {
          case EditType.REPLACE: {
            originalEvent.occurrences = eventIntervals.set.sort();
            break;
          }
          case EditType.MODIFY: {
            const newEventIntervals = [];
            // Loop over all the existing intervals
            for (const interval of originalEvent.occurrences) {
              // Assume we should add the interval
              let shouldAdd = true;
              // Loop over all the intervals to remove
              for (const intervalToModify of eventIntervals.remove) {
                // If the interval is in the list of intervals to remove, don't add it
                if (interval.equals(intervalToModify)) {
                  shouldAdd = false;
                  break;
                }
              }
              // IF we didn't find the interval in the list of intervals to remove, add it to the new list
              if (shouldAdd) newEventIntervals.push(interval);
            }
            for (const interval of eventIntervals.add) {
              // Add all the intervals to add
              newEventIntervals.push(interval);
            }
            break;
          }
        }
      }

      const modifiedEvent = await transaction.save(originalEvent);

      logDebug(`Edited event: ${modifiedEvent.eventId}`, modifiedEvent);

      return modifiedEvent;
    }
  });
}
