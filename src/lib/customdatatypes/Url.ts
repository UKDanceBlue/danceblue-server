import { DataTypes } from "@sequelize/core";

export class UrlDataType extends DataTypes.ABSTRACT<URL> {
  toSql() {
    return "text";
  }

  validate(value: unknown): value is URL {
    return value instanceof URL;
  }

  areValuesEqual(value: URL, originalValue: URL): boolean {
    return value.toString() === originalValue.toString();
  }

  escape(value: URL): string {
    return value.toString();
  }

  toBindableValue(value: URL): string {
    return this.escape(value);
  }

  parseDatabaseValue(value: unknown): unknown {
    if (typeof value !== "string") throw new Error("Not a string");
    return new URL(value);
  }
}
