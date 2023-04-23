import type {
  CreateEventBody,
  EditEventBody,
  GetEventParams,
  ListEventsQuery,
  PaginationOptions,
  ParsedCreateEventBody,
  ParsedEditEventBody,
  SortingOptions,
} from "@ukdanceblue/db-app-common";
import { EditType, parseBodyDateTime } from "@ukdanceblue/db-app-common";
import joi from "joi";
import { Interval } from "luxon";

import { LuxonError, ParsingError } from "../lib/CustomErrors.js";
import { logInfo, logWarning } from "../logger.js";

import {
  makeFilterOptionsSchema,
  paginationOptionsSchema,
  sortingOptionsSchema,
} from "./Query.js";
import { mapEditArray, startEndDateTimeToInterval } from "./commonParsers.js";
import { intervalSchema } from "./commonSchemas.js";
import { makeEditArrayValidator } from "./editValidation.js";
import { makeValidator } from "./makeValidator.js";

const createEventBodySchema: joi.StrictSchemaMap<CreateEventBody> = {
  eventTitle: joi.string().required(),
  eventSummary: joi.string().optional().max(100),
  eventDescription: joi.string().optional(),
  eventAddress: joi.string().optional(),
  eventOccurrences: joi.array().items(intervalSchema).default([]),
  timezone: joi.string().optional(),
};

const createEventBodyValidator = makeValidator<CreateEventBody>(
  joi.object(createEventBodySchema)
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
export function parseCreateEventBody(body: unknown): ParsedCreateEventBody {
  const { value: eventBody, warning } = createEventBodyValidator(body);

  if (warning) {
    logWarning("Error parsing new event body: %s", warning.annotate());
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

  const parsedBody: ParsedCreateEventBody = {
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
  .object<ListEventsQuery>({})
  .keys(paginationOptionsSchema)
  .keys(sortingOptionsSchema)
  .keys(
    makeFilterOptionsSchema(
      [
        "eventTitle",
        "eventSummary",
        "eventDescription",
        "eventAddress",
        "eventOccurrences",
      ],
      [
        ["eventTitle", joi.string()],
        ["eventSummary", joi.string()],
        ["eventDescription", joi.string()],
        ["eventAddress", joi.string()],
        ["eventOccurrences", joi.array().items(intervalSchema).default([])],
      ]
    )
  );

logInfo("listEventsQuerySchema", listEventsQuerySchema.describe());

const listEventsQueryValidator = makeValidator<ListEventsQuery>(
  listEventsQuerySchema
);

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
    logWarning("Error parsing list events query: %s", warning.annotate());
  }

  if (!parsedQuery) {
    throw new ParsingError("Invalid list events query");
  }

  return parsedQuery;
}

const getEventParamsSchema = joi.object<GetEventParams>({
  eventId: joi.string().uuid({ version: "uuidv4" }).required(),
});

const singleEventParamsValidator =
  makeValidator<GetEventParams>(getEventParamsSchema);

/**
 * Parses the params of a get event request. Uses Joi to validate the params
 *
 * @param params The params of the request
 * @return The parsed params
 * @throws An error if the params are invalid
 */
export function parseSingleEventParams(params: unknown): GetEventParams {
  const { value: parsedParams, warning } = singleEventParamsValidator(params);

  if (warning) {
    logWarning("Error parsing get event params: %s", warning.annotate());
  }

  if (!parsedParams) {
    throw new ParsingError("Invalid get event params");
  }

  return parsedParams;
}

const editEventBodySchema = joi.alternatives<EditEventBody>(
  joi.object<EditEventBody & { type: EditType.MODIFY }>({
    type: joi.number().valid(EditType.MODIFY).required(),
    value: joi.object({
      eventTitle: joi.string().optional(),
      eventSummary: joi.string().allow(null).optional().max(100),
      eventDescription: joi.string().allow(null).optional(),
      eventAddress: joi.string().allow(null).optional(),
      eventOccurrences: makeEditArrayValidator(intervalSchema).optional(),
    }),
  })
);

const editEventBodyValidator =
  makeValidator<EditEventBody>(editEventBodySchema);

/**
 * Parses the body of an edit event request. Uses Joi to validate the body
 * and throw an error if it is invalid. Then it converts the start and end
 * date times to a Luxon Interval. If either is invalid, it will throw an
 * error. If everything is valid, it returns the parsed body.
 *
 * @param body The body of the request
 * @throws An error if the body is invalid
 * @throws An error if the start or end date time is invalid
 * @return The parsed body
 */
export function parseEditEventBody(body: unknown): ParsedEditEventBody {
  const { value: eventBody, warning } = editEventBodyValidator(body);

  if (warning) {
    logWarning("Error parsing edit event body: %s", warning.annotate());
  }

  if (!eventBody) {
    throw new ParsingError("Invalid event body");
  }

  switch (eventBody.type) {
    case EditType.MODIFY: {
      const parsedBody: ParsedEditEventBody = {
        type: EditType.MODIFY,
        value: {},
      };

      // TODO find a better approach than all of these if statements
      if (eventBody.value.eventTitle)
        parsedBody.value.eventTitle = eventBody.value.eventTitle;
      if (eventBody.value.eventSummary)
        parsedBody.value.eventSummary = eventBody.value.eventSummary;
      if (eventBody.value.eventDescription)
        parsedBody.value.eventDescription = eventBody.value.eventDescription;
      if (eventBody.value.eventAddress)
        parsedBody.value.eventAddress = eventBody.value.eventAddress;
      if (eventBody.value.eventOccurrences) {
        parsedBody.value.eventIntervals = mapEditArray(
          eventBody.value.eventOccurrences,
          startEndDateTimeToInterval
        );
      }
      return parsedBody;
    }
    case EditType.REPLACE: {
      return {
        type: EditType.REPLACE,
        value: parseCreateEventBody(eventBody.value),
      };
    }
    default: {
      throw new ParsingError("Invalid event body");
    }
  }
}
