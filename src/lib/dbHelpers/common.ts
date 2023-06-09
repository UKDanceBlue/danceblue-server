import type { Attributes, Model } from "@sequelize/core";
import type { Resource } from "@ukdanceblue/db-app-common";

import type { IntermediateClass } from "../modelTypes.js";

export type ResourceToModelKeyMapping<
  R extends Resource,
  M extends Model & IntermediateClass<R>
> = Partial<Record<keyof R, keyof Attributes<M> & string>>;
