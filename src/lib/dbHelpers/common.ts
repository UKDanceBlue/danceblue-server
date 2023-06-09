import type { Model } from "@sequelize/core";
import type { Resource } from "@ukdanceblue/db-app-common";

import type { IntermediateOf } from "../modelTypes.js";

export type ResourceToModelKeyMapping<
  R extends Resource,
  M extends Model,
  I extends IntermediateOf<R, M>
> = Partial<Record<keyof R, keyof I & string>>;
