import { DateTime } from "luxon";
import { ValueTransformer } from "typeorm";

export const luxonDateTimeJsDateTransformer: ValueTransformer = {
  from: (value: Date) => {
    return DateTime.fromJSDate(value, { zone: "utc" });
  },
  to: (value?: DateTime | null | undefined | Record<string, never>) => {
    return value?.toJSDate?.();
  }
};

export const luxonDateISOStringTransformer: ValueTransformer = {
  from: (value: string) => {
    return DateTime.fromISO(value, { zone: "utc" });
  },
  to: (value?: DateTime | null | undefined | Record<string, never>) => {
    return value?.toISODate?.();
  }
};

export const luxonTimeISOStringTransformer: ValueTransformer = {
  from: (value: string) => {
    return DateTime.fromISO(value, { zone: "utc" });
  },
  to: (value?: DateTime | null | undefined | Record<string, never>) => {
    return value?.toISOTime?.();
  }
};
