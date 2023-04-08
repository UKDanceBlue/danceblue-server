import { DateTime } from "luxon";
import { ValueTransformer } from "typeorm";

export const luxonDateTimeJsDateTransformer: ValueTransformer = {
  from: (value: Date): DateTime => {
    return DateTime.fromJSDate(value, { zone: "utc" });
  },
  to: (
    value?: DateTime | null | undefined | Record<string, never>
  ): Date | undefined => {
    if (!value) return undefined;
    if (!DateTime.isDateTime(value)) throw new Error("Not a DateTime");
    return value.toJSDate();
  },
};

export const luxonDateTimeJsDateArrayTransformer: ValueTransformer = {
  from: (value: Date[]): DateTime[] => {
    return value.map((date) => DateTime.fromJSDate(date, { zone: "utc" }));
  },
  to: (value?: DateTime[] | null | undefined | Record<string, never>) => {
    if (!value) return undefined;
    if (!Array.isArray(value)) throw new Error("Not an array");
    return value.map((dateTime) => {
      if (!DateTime.isDateTime(dateTime)) throw new Error("Not a DateTime");
      return dateTime.toJSDate();
    });
  },
};

export const luxonDateISOStringTransformer: ValueTransformer = {
  from: (value: string) => {
    return DateTime.fromISO(value, { zone: "utc" });
  },
  to: (value?: DateTime | null | undefined | Record<string, never>) => {
    return value?.toISODate?.();
  },
};

export const luxonTimeISOStringTransformer: ValueTransformer = {
  from: (value: string) => {
    return DateTime.fromISO(value, { zone: "utc" });
  },
  to: (value?: DateTime | null | undefined | Record<string, never>) => {
    return value?.toISOTime?.();
  },
};
