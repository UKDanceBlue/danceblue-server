import type { BodyDateTime } from "@ukdanceblue/db-app-common";
import joi from "joi";

export const bodyDateTimeSchema = joi.alternatives<BodyDateTime>(
  joi.object<BodyDateTime>({
    date: joi.string().required(),
    time: joi.string().required(),
    timezone: joi.string(),
  }),
  joi.object<BodyDateTime>({
    dateTimeString: joi.string().required().isoDate(),
    timezone: joi.string(),
  })
);
