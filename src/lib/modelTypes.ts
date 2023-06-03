import { Model } from "@sequelize/core";
import type { CreationOptional } from "@sequelize/core";
import type { Resource } from "@ukdanceblue/db-app-common";

export interface WithToResource<R extends Resource> {
  toResource(): R;
}

export class WithTimestamps<
  // eslint-disable-next-line @typescript-eslint/ban-types
  TModelAttributes extends {} = never,
  // eslint-disable-next-line @typescript-eslint/ban-types
  TCreationAttributes extends {} = TModelAttributes
> extends Model<TModelAttributes, TCreationAttributes> {
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}
