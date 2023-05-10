import type {
  BodyDateTime,
  BodyDateTimeRange,
  EditArray,
} from "@ukdanceblue/db-app-common";
import { EditType, parseBodyDateTime } from "@ukdanceblue/db-app-common";
import type { DateTime } from "luxon";
import { Interval } from "luxon";

import { LuxonError } from "../lib/CustomErrors.js";

/**
 * Convert a BodyDateTime to a DateTime
 *
 * @param dateTime BodyDateTime
 * @return DateTime
 */
export function startEndToDateTime(dateTime: BodyDateTime): DateTime {
  const parsed = parseBodyDateTime(dateTime);
  if (!parsed.isValid) throw new LuxonError(parsed);

  return parsed;
}

/**
 * Convert a BodyDateTime to a DateTime
 *
 * @param dateTime BodyDateTime
 * @param dateTime.start Start date time
 * @param dateTime.end End date time
 * @return Interval
 * @throws A LuxonError if the start or end date time is invalid
 */
export function startEndDateTimeToInterval(
  dateTime: BodyDateTimeRange
): Interval {
  const start = startEndToDateTime(dateTime.start);
  const end = startEndToDateTime(dateTime.end);

  const interval = Interval.fromDateTimes(start, end);
  if (!interval.isValid) throw new LuxonError(interval);

  return interval;
}

/**
 * Map an EditArray
 *
 * @param value EditArray
 * @param replacer Function to replace the value
 * @return EditArray
 */
export function mapEditArray<I, O>(
  value: EditArray<I[]>,
  replacer: (value: I) => O
): EditArray<O[]> {
  let newArray: EditArray<O[]>;

  switch (value.type) {
    case EditType.MODIFY: {
      const itemsToAdd = value.add.map((item) => replacer(item));
      const itemsToRemove = value.remove.map((item) => replacer(item));

      newArray = {
        type: EditType.MODIFY,
        add: itemsToAdd,
        remove: itemsToRemove,
      };
      break;
    }
    case EditType.REPLACE: {
      const items = value.set.map((item) => replacer(item));

      newArray = {
        type: EditType.REPLACE,
        set: items,
      };
      break;
    }
  }

  return newArray;
}
