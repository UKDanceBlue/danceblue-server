import type { Dialect } from "@sequelize/core";
import { DataTypes } from "@sequelize/core";
import { DateTime, Interval } from "luxon";
import {
  Range,
  parse as parseRange,
  serialize as serializeRange,
} from "postgres-range";

/**
 * Sequelize data type for a PostgreSQL tsrange.
 *
 * Maps to a Luxon Interval, always in UTC.
 */
export class UtcRangeDataType extends DataTypes.ABSTRACT<Interval> {
  toSql() {
    return "tsrange";
  }

  validate(value: unknown): value is Interval {
    return (
      (Interval.isInterval(value) &&
        value.isValid &&
        value.start?.isValid &&
        value.end?.isValid) ??
      false
    );
  }

  sanitize(value: Interval): Interval {
    return value.mapEndpoints((endpoint) =>
      endpoint.reconfigure({ locale: "en-US" }).toUTC()
    );
  }

  areValuesEqual(
    value: Interval | null,
    originalValue: Interval | null
  ): boolean {
    return value == null || originalValue == null
      ? value === originalValue
      : value.equals(originalValue);
  }

  escape(value: Interval): string {
    const range = new Range<DateTime>(value.start, value.end, 0);
    return serializeRange<DateTime>(range, (dateTime) => {
      const stringified = dateTime.toSQL({
        includeOffset: false,
        includeOffsetSpace: false,
        includeZone: false,
      });
      if (stringified == null) {
        throw new Error("Could not serialize DateTime to ISO string");
      }
      return stringified;
    });
  }

  toBindableValue(value: Interval): string {
    return this.escape(value);
  }

  parseDatabaseValue(value: unknown): Interval | null {
    if (value == null) return null;
    if (typeof value !== "string") throw new Error("Not a string");
    const range = parseRange(value, (value) =>
      DateTime.fromSQL(value, { zone: "utc", locale: "en-US" })
    );
    if (range.lower == null || range.upper == null)
      throw new Error("Not a range");
    return Interval.fromDateTimes(range.lower, range.upper);
  }

  _checkOptionSupport({ name }: { name: Dialect }) {
    if (name === "postgres") return;
    throw new Error("UtcInterval is only supported on PostgreSQL");
  }
}
