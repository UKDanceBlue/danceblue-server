import type { ParsedNewEventBody } from "@ukdanceblue/db-app-common";
import type { DateTime } from "luxon";

import { appDataSource } from "../data-source.js";
import { Event } from "../entity/Event.js";

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
  event.title = body.eventTitle;
  if (body.eventSummary) event.summary = body.eventSummary;
  if (body.eventDescription) event.description = body.eventDescription;
  if (body.eventAddress) event.location = body.eventAddress;

  if (body.eventIntervals.length > 0) {
    const eventStartDateTimes: DateTime[] = [];
    const eventEndDateTimes: DateTime[] = [];
    for (const interval of body.eventIntervals) {
      console.log(interval);
      if (!interval.start || !interval.end) {
        console.error("Invalid interval:", interval.toString());
        throw new Error("Invalid interval");
      }
      eventStartDateTimes.push(interval.start);
      eventEndDateTimes.push(interval.end);
    }
    event.start = eventStartDateTimes;
    event.end = eventEndDateTimes;
  }

  console.log(event);

  return EventRepository.save(event);
}
