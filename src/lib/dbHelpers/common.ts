import type { Attributes, Model } from "@sequelize/core";
import type { Resource } from "@ukdanceblue/db-app-common";

import type { WithToResource } from "../modelTypes.js";

export type ResourceToModelKeyMapping<
  R extends Resource,
  M extends Model & WithToResource<R>
> = Partial<Record<keyof R, keyof Attributes<M> & string>>;
