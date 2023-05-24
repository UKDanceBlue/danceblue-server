import type { Attributes, Model } from "@sequelize/core";
import type { Resource } from "@ukdanceblue/db-app-common";

import type { ModelFor } from "../modelTypes.js";

export type ResourceToModelKeyMapping<
  R extends Resource,
  M extends Model & ModelFor<R>
> = Partial<Record<keyof R, keyof Attributes<M> & string>>;
