import { DateObjectUnits, DateTime } from "luxon";

export type HtmlMonthString = `${number}-${number}`;
export interface HtmlMonthParts {
  year: number;
  month: number;
}

/**
 * Checks if a string is a valid HTML month string.
 *
 * @param htmlMonthString The string to check
 * @return True if the string is a valid HTML month string
 */
export function isHtmlMonthString(
  htmlMonthString: string
): htmlMonthString is HtmlMonthString {
  return /^\d{4,}-\d{2}$/.test(htmlMonthString);
}

/**
 * Parses an HTML month string into a year and month number.
 *
 * @param htmlMonthString The HTML month string (e.g. "2021-10")
 * @return The year and month number
 */
export function parseHtmlMonthString(
  htmlMonthString: HtmlMonthString
): HtmlMonthParts {
  const [year, month] = htmlMonthString.split("-").map(Number);
  if (!year || !month) {
    throw new Error("Invalid HTML month string");
  }
  return { year, month };
}

export type HtmlDateString = `${HtmlMonthString}-${number}`;
export interface HtmlDateParts extends HtmlMonthParts {
  day: number;
}

/**
 * Checks if a string is a valid HTML date string.
 *
 * @param htmlDateString The string to check
 * @return True if the string is a valid HTML date string
 */
export function isHtmlDateString(
  htmlDateString: string
): htmlDateString is HtmlDateString {
  return /^\d{4,}-\d{2}-\d{2}$/.test(htmlDateString);
}

/**
 * Parses an HTML date string into a year, month, and day number.
 *
 * @param htmlDateString The HTML date string (e.g. "2021-10-31")
 * @return The year, month, and day number
 */
export function parseHtmlDateString(
  htmlDateString: HtmlDateString
): HtmlDateParts {
  const [year, month, day] = htmlDateString.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Invalid HTML date string");
  }
  return { year, month, day };
}

export type HtmlTimeString =
  | `${number}:${number}`
  | `${number}:${number}:${number}`;
export interface HtmlTimeParts {
  hour: number;
  minute: number;
  second: number;
}

/**
 * Checks if a string is a valid HTML time string.
 *
 * @param htmlTimeString The string to check
 * @return True if the string is a valid HTML time string
 */
export function isHtmlTimeString(
  htmlTimeString: string
): htmlTimeString is HtmlTimeString {
  return /^\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(htmlTimeString);
}

/**
 * Parses an HTML time string into a hour, minute, and second number.
 *
 * @param htmlTimeString The HTML time string (e.g. "12:00" or "12:00:00")
 * @return The hour, minute, and second number
 * @throws An error if the time string is invalid
 */
export function parseHtmlTimeString(
  htmlTimeString: HtmlTimeString
): HtmlTimeParts {
  const [hour, minute, second] = htmlTimeString.split(":").map(Number);
  if (
    !hour ||
    !minute ||
    hour > 23 ||
    hour < 0 ||
    minute > 59 ||
    minute < 0 ||
    (second && !(second >= 0 && second < 60))
  ) {
    throw new Error("Invalid HTML time string");
  }
  return {
    hour,
    minute,
    second: Number.isNaN(second ?? Number.NaN) ? 0 : second ?? 0,
  };
}

export type HtmlDateTimeString = `${HtmlDateString}T${HtmlTimeString}`;
export interface HtmlDateTimeParts extends HtmlDateParts, HtmlTimeParts {}

/**
 * Checks if a string is a valid HTML date time string.
 *
 * @param htmlDateTimeString The string to check
 * @return True if the string is a valid HTML date time string
 */
export function isHtmlDateTimeString(
  htmlDateTimeString: string
): htmlDateTimeString is HtmlDateTimeString {
  return /^\d{4,}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(
    htmlDateTimeString
  );
}

/**
 * Parses an HTML date time string into a Luxon DateTime.
 *
 * @param htmlDateTimeString The HTML date time string (e.g. "2021-10-31T12:00:00")
 * @return The day, month, year, hour, minute, and second number
 * @throws An error if the date or time is invalid
 */
export function parseHtmlDateTimeString(
  htmlDateTimeString: HtmlDateTimeString
): HtmlDateTimeParts {
  const [date, time] = htmlDateTimeString.split("T") as [
    HtmlDateString,
    HtmlTimeString
  ];
  return {
    ...parseHtmlDateString(date),
    ...parseHtmlTimeString(time),
  };
}

export type BodyDateTime =
  | {
      date: HtmlDateString;
      time: HtmlTimeString;
      timezone?: string;
    }
  | {
      dateTimeString: HtmlDateTimeString;
      timezone?: string;
    };

/**
 * Checks if a value is a valid body date time.
 *
 * @param bodyDateTime The value to check
 * @return True if the value is a valid body date time
 */
export function isBodyDateTime(
  bodyDateTime: unknown
): bodyDateTime is BodyDateTime {
  if (typeof bodyDateTime !== "object" || bodyDateTime === null) {
    return false;
  }

  if ("dateTimeString" in bodyDateTime) {
    if (
      !(
        typeof bodyDateTime.dateTimeString === "string" &&
        isHtmlDateTimeString(bodyDateTime.dateTimeString)
      )
    ) {
      return false;
    }
  } else if ("date" in bodyDateTime && "time" in bodyDateTime) {
    if (
      !(
        typeof bodyDateTime.date === "string" &&
        isHtmlDateString(bodyDateTime.date) &&
        typeof bodyDateTime.time === "string" &&
        isHtmlTimeString(bodyDateTime.time)
      )
    ) {
      return false;
    }
  } else {
    return false;
  }

  if ("timezone" in bodyDateTime) {
    if (typeof bodyDateTime.timezone !== "string") {
      return false;
    }
  }

  return true;
}

/**
 * Parses a body date time into a Luxon DateTime.
 *
 * @param bodyDateTime The body date time
 * @param defaultTimeZone The default time zone to use if none is specified in the body date time
 * @return The Luxon DateTime
 * @throws An error if the date or time is invalid
 * @throws An error if the resulting DateTime is invalid
 */
export function parseBodyDateTime(
  bodyDateTime: BodyDateTime,
  defaultTimeZone = "UTC"
): DateTime {
  let dateTimeParts: DateObjectUnits = {};
  if ("dateTimeString" in bodyDateTime) {
    dateTimeParts = parseHtmlDateTimeString(bodyDateTime.dateTimeString);
  } else {
    dateTimeParts = parseHtmlDateString(bodyDateTime.date);
    const {
      hour: h,
      minute: min,
      second: s,
    } = parseHtmlTimeString(bodyDateTime.time);
    dateTimeParts = {
      ...dateTimeParts,
      hour: h,
      minute: min,
      second: s,
    };
  }

  dateTimeParts.millisecond = 0;
  if (dateTimeParts.second) {
    const truncatedSeconds = Math.trunc(dateTimeParts.second);
    const decimalSeconds = dateTimeParts.second - truncatedSeconds;
    dateTimeParts.millisecond = Math.round(decimalSeconds * 1000);
    dateTimeParts.second = truncatedSeconds;
  }

  const timezone = bodyDateTime.timezone ?? defaultTimeZone;
  const dateTime = DateTime.fromObject(dateTimeParts, {
    zone: timezone,
  });

  if (!dateTime.isValid) {
    throw new Error("Invalid body date time");
  }

  return dateTime;
}
