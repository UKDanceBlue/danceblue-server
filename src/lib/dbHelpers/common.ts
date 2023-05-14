import type { Attributes, Model } from "@sequelize/core";
import type { ApiResource } from "@ukdanceblue/db-app-common";

import type { ModelFor } from "../modelTypes.js";

export type ResourceToModelKeyMapping<
  R extends ApiResource,
  M extends Model & ModelFor<R>
> = Partial<Record<keyof R, keyof Attributes<M> & string>>;
