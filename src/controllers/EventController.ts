import type { FindOptions } from "@sequelize/core";
import type {
  ListEventsQuery,
  ParsedCreateEventBody,
  ParsedEditEventBody,
} from "@ukdanceblue/db-app-common";
import { EditType } from "@ukdanceblue/db-app-common";
import createHttpError from "http-errors";

import { sequelizeDb } from "../data-source.js";
import { logDebug } from "../logger.js";
import { EventModel } from "../models/Event.js";

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
  const { page, pageSize, sortBy, sortDirection, include, exclude, filter } =
    query;

  const options: FindOptions<Event> = {
    offset: page * pageSize,
    limit: pageSize,
  };

  if (sortBy && sortDirection) {
    options.order = [[sortBy, sortDirection]];
  }

  const totalIncludesExclude: number =
    (include ?? []).length + (exclude ?? []).length;

  if (totalIncludesExclude > 0) {
    options.attributes = {
      include: include ?? [],
      exclude: exclude ?? [],
    };
  }

  if (filter) {
    // TODO figure out where
    // const filterOptions: Partial<Record<keyof typeof filter, string>> = {}
    // for (const key of Object.keys(filter)) {
    //   filterOptions[key as keyof typeof filter] = filter[key as keyof typeof filter];
    // }
    // options.where = filterOptions;
  }

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

  if (body.eventSummary !== undefined) createdEvent.summary = body.eventSummary;
  if (body.eventDescription !== undefined)
    createdEvent.description = body.eventDescription;
  if (body.eventAddress !== undefined)
    createdEvent.location = body.eventAddress;
  createdEvent.occurrences = body.eventIntervals;

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
      replacementEvent.occurrences = body.value.eventIntervals;

      replacementEvent = await replacementEvent.save({ transaction });

      logDebug(`Replaced event: ${replacementEvent.eventId}`);

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

      const modifiedEvent = await originalEvent.save({ transaction });

      logDebug(`Edited event: ${modifiedEvent.eventId}`, modifiedEvent);

      return modifiedEvent;
    }
  });
}
