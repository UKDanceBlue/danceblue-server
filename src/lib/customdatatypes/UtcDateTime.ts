import { DataTypes } from "@sequelize/core";
import { DateTime } from "luxon";

/**
 * Sequelize data type for a PostgreSQL timestamptz.
 *
 * Maps to a Luxon DateTime, always in UTC.
 */
export class UtcDateTimeDataType extends DataTypes.ABSTRACT<DateTime> {
  toSql() {
    return "timestamptz";
  }

  validate(value: unknown): value is DateTime {
    return DateTime.isDateTime(value) && value.isValid;
  }

  sanitize(value: DateTime): DateTime {
    return value.reconfigure({ locale: "en-US" }).toUTC();
  }

  areValuesEqual(value: DateTime, originalValue: DateTime): boolean {
    return value.equals(originalValue);
  }

  escape(value: DateTime): string {
    const stringified = value.toSQL({
      includeOffset: false,
      includeOffsetSpace: false,
      includeZone: false,
    });
    if (stringified == null) {
      throw new Error("Could not serialize DateTime to ISO string");
    }
    return stringified;
  }

  toBindableValue(value: DateTime): string {
    return this.escape(value);
  }

  parseDatabaseValue(value: unknown): unknown {
    if (typeof value !== "string") throw new Error("Not a string");
    return DateTime.fromSQL(value, { zone: "utc", locale: "en-US" })
  }
}
