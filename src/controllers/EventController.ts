import type { ParsedCreateEventBody } from "@ukdanceblue/db-app-common";

import { appDataSource } from "../data-source.js";
import { Event } from "../entity/Event.js";
import { logDebug } from "../logger.js";

export const EventRepository = appDataSource.getRepository(Event).extend({
  findByEventId(eventId: string) {
    return this.findOneBy({ eventId });
  },
});

/**
 * @param body - The body of the request
 * @return The parsed body
 */
export async function createEventFrom(
  body: ParsedCreateEventBody
): Promise<Event> {
  const event = new Event();
  event.title = body.eventTitle;
  if (body.eventSummary) event.summary = body.eventSummary;
  if (body.eventDescription) event.description = body.eventDescription;
  if (body.eventAddress) event.location = body.eventAddress;
  if (body.eventIntervals.length > 0) event.occurrences = body.eventIntervals;
  // TODO: Add images

  const createdEvent = await EventRepository.save(event);

  logDebug(`Created event: ${createdEvent.eventId}`, createdEvent);

  return createdEvent;
}
