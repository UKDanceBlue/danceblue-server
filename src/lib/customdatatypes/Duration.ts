import { DataTypes } from "@sequelize/core";
import { Duration } from "luxon";

export class DurationDataType extends DataTypes.ABSTRACT<Duration> {
  toSql() {
    return "text";
  }

  validate(value: unknown): value is Duration {
    return value instanceof Duration;
  }

  areValuesEqual(
    value: Duration | null | undefined,
    originalValue: Duration | null | undefined
  ): boolean {
    return value == null || originalValue == null
      ? value === originalValue
      : value.equals(originalValue);
  }

  escape(value: Duration): string {
    const stringified = value.toISO();
    if (stringified == null) {
      throw new Error("Could not serialize Duration to ISO string");
    }
    return stringified;
  }

  toBindableValue(value: Duration): string {
    return this.escape(value);
  }

  parseDatabaseValue(value: unknown): unknown {
    if (typeof value !== "string") throw new Error("Not a string");
    return Duration.fromISO(value);
  }
}
