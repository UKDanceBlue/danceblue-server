import joi from "joi";
import { Interval } from "luxon";

import { LuxonError, ParsingError } from "../lib/CustomErrors.js";
import { NewEventBody, ParsedNewEventBody } from "../lib/request/Event.js";
import { PaginationOptions, SortingOptions } from "../lib/request/Query.js";
import { parseBodyDateTime } from "../lib/request/htmlDateTime.js";

import { bodyDateTimeSchema } from "./BodyDateTime.js";
import { paginationOptionsSchema, sortingOptionsSchema } from "./Query.js";
import { makeValidator } from "./makeValidator.js";

const newEventBodySchema: joi.StrictSchemaMap<NewEventBody> = {
  eventTitle: joi.string().required(),
  eventSummary: joi.string().optional().max(100),
  eventDescription: joi.string().optional(),
  eventAddress: joi.string().optional(),
  eventOccurrences: joi
    .array()
    .items(
      joi.object({
        start: bodyDateTimeSchema.required(),
        end: bodyDateTimeSchema.required(),
      })
    )
    .default([]),
  timezone: joi.string().optional(),
};

const newEventBodyValidator = makeValidator<NewEventBody>(
  joi.object(newEventBodySchema)
);

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
  const { value: eventBody, warning } = newEventBodyValidator(body);

  if (warning) {
    console.error("Error parsing new event body:", warning.annotate());
  }

  if (!eventBody) {
    throw new ParsingError("Invalid event body");
  }

  const eventIntervals = eventBody.eventOccurrences.map((occurrence) => {
    const start = parseBodyDateTime(occurrence.start, eventBody.timezone);
    if (!start.isValid) throw new LuxonError(start);
    const end = parseBodyDateTime(occurrence.end, eventBody.timezone);
    if (!end.isValid) throw new LuxonError(end);

    const interval = Interval.fromDateTimes(start, end);
    if (!interval.isValid) throw new ParsingError("Invalid interval");

    return interval;
  });

  const parsedBody: ParsedNewEventBody = {
    eventTitle: eventBody.eventTitle,
    eventIntervals,
  };

  if (eventBody.eventSummary) parsedBody.eventSummary = eventBody.eventSummary;
  if (eventBody.eventDescription)
    parsedBody.eventDescription = eventBody.eventDescription;
  if (eventBody.eventAddress) parsedBody.eventAddress = eventBody.eventAddress;

  return parsedBody;
}

const listEventsQuerySchema = joi
  .object<PaginationOptions & SortingOptions>({})
  .keys(paginationOptionsSchema)
  .keys(sortingOptionsSchema);

const listEventsQueryValidator = makeValidator<
  PaginationOptions & SortingOptions
>(listEventsQuerySchema);

/**
 * Parses the query of a list events request. Uses Joi to validate the query
 * and throw an error if it is invalid. If everything is valid, it returns
 * the parsed query.
 *
 * @param query The query of the request
 * @return The parsed query
 * @throws An error if the query is invalid
 */
export function parseListEventsQuery(
  query: unknown
): PaginationOptions & SortingOptions {
  const { value: parsedQuery, warning } = listEventsQueryValidator(query);

  if (warning) {
    console.error("Error parsing list events query:", warning.annotate());
  }

  if (!parsedQuery) {
    throw new ParsingError("Invalid list events query");
  }

  return parsedQuery;
}
