import { DataTypes } from "@sequelize/core";
import { DateTime } from "luxon";

type RawDate = Date | string | number;

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

  areValuesEqual(
    value: DateTime | null,
    originalValue: DateTime | null
  ): boolean {
    return value == null || originalValue == null
      ? value === originalValue
      : value.equals(originalValue);
  }

  escape(value: DateTime): string {
    const { usageContext } = this;
    if (!usageContext) {
      throw new Error("Cannot escape DateTime without usage context");
    }

    const stringified = value.toSQL({
      includeOffset: false,
      includeOffsetSpace: false,
      includeZone: false,
    });
    if (stringified == null) {
      throw new Error("Could not serialize DateTime to ISO string");
    }
    return usageContext.sequelize.queryGenerator.escape(stringified);
  }

  toBindableValue(value: DateTime): RawDate {
    return value.toJSDate();
  }

  parseDatabaseValue(value: RawDate | null | undefined): DateTime | null {
    if (value == null) {
      return null;
    }
    if (value instanceof Date) {
      return DateTime.fromJSDate(value, { zone: "utc" });
    } else if (typeof value === "string") {
      return DateTime.fromSQL(value, { zone: "utc", locale: "en-US" });
    } else if (typeof value === "number") {
      return DateTime.fromMillis(value, { zone: "utc" });
    } else {
      throw new TypeError("Could not parse DateTime from database value");
    }
  }
}
