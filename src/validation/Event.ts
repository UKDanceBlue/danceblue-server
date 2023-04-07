import joi from "joi";
import { Interval } from "luxon";

import { LuxonError, ParsingError } from "../lib/CustomErrors.js";
import { bodyArrayToArray } from "../lib/bodyArray.js";
import { NewEventBody, ParsedNewEventBody } from "../lib/request/Event.js";
import {
  BodyDateTime,
  isBodyDateTime,
  parseBodyDateTime,
} from "../lib/request/common.js";

import { makeValidator } from "./makeValidator.js";

const newEventBodySchema = joi
  .object<NewEventBody>({
    eventName: joi.string().required(),
    eventSummary: joi.string().required().max(100),
    eventDescription: joi.string().required(),
    eventAddress: joi.string().required(),
  })
  .pattern(/eventOccurrence\[\d+\]\./, [
    joi.object<BodyDateTime>({
      dateTimeString: joi.string().required(),
      timezone: joi.string().optional(),
    }),
    joi.object<BodyDateTime>({
      date: joi.string().required(),
      time: joi.string().required(),
      timezone: joi.string().optional(),
    }),
  ]);

const newEventBodyValidator = makeValidator(newEventBodySchema);

/**
 * Parses the body of a new event request. Uses Joi to validate the body
 * and throw an error if it is invalid. Then it converts the start and end
 * date times to a Luxon Interval. If either is invalid, it will throw an
 * error. If everything is valid, it returns the parsed body.
 *
 * @param body The body of the request
 * @return The parsed body
 * @throws An error if the body is invalid
 * @throws An error if the start or end date time is invalid
 */
export function parseNewEventBody(body: unknown): ParsedNewEventBody {
  const { value, warning } = newEventBodyValidator(body);

  if (warning) {
    console.error("Error parsing new event body:", warning.annotate());
  }

  const eventIntervals = bodyArrayToArray(
    "eventOccurrence",
    value,
    (eventOccurrence: { start: BodyDateTime; end: BodyDateTime }): Interval => {
      if (!isBodyDateTime(eventOccurrence.start)) {
        throw new ParsingError(
          "Invalid start date time",
          eventOccurrence.start
        );
      }
      if (!isBodyDateTime(eventOccurrence.end)) {
        throw new ParsingError("Invalid end date time", eventOccurrence.end);
      }

      const eventStartDateTime = parseBodyDateTime(eventOccurrence.start);
      const eventEndDateTime = parseBodyDateTime(eventOccurrence.end);

      if (!eventStartDateTime.isValid) {
        throw new LuxonError(eventStartDateTime);
      }
      if (!eventEndDateTime.isValid) {
        throw new LuxonError(eventEndDateTime);
      }

      const eventInterval = Interval.fromDateTimes(
        eventStartDateTime,
        eventEndDateTime
      );
      if (!eventInterval.isValid) {
        throw new LuxonError(eventInterval);
      }

      return eventInterval;
    }
  );

  return {
    eventName: value.eventName,
    eventSummary: value.eventSummary,
    eventDescription: value.eventDescription,
    eventAddress: value.eventAddress,
    eventIntervals,
  };
}
