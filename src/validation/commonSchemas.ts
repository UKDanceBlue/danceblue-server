import Joi from "joi";

import { bodyDateTimeSchema } from "./BodyDateTime.js";

export const intervalSchema = Joi.object({
  start: bodyDateTimeSchema.required(),
  end: bodyDateTimeSchema.required(),
});
