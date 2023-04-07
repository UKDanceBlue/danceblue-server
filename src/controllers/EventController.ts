import { DateTime } from "luxon";

import { appDataSource } from "../data-source.js";
import { Event } from "../entity/Event.js";
import { ParsedNewEventBody } from "../lib/request/Event.js";

export const EventRepository = appDataSource.getRepository(Event).extend({
  findByEventId(eventId: string) {
    return this.findOneBy({ eventId });
  },
});

/**
 * @param body - The body of the request
 * @return The parsed body
 */
export function createEventFrom(body: ParsedNewEventBody) {
  const event = new Event();
  event.title = body.eventName;
  event.summary = body.eventSummary;
  event.description = body.eventDescription;
  event.location = body.eventAddress;

  if (body.eventIntervals.length > 0) {
    const eventStartDateTimes: DateTime[] = [];
    const eventEndDateTimes: DateTime[] = [];
    body.eventIntervals.forEach((interval) => {
      eventStartDateTimes.push(interval.start);
      eventEndDateTimes.push(interval.end);
    });
    event.start = eventStartDateTimes;
    event.end = eventEndDateTimes;
  }

  return EventRepository.save(event);
}
