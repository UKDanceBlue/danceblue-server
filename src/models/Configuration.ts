import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import { Attribute } from "@sequelize/core/decorators-legacy";
import { ConfigurationResource } from "@ukdanceblue/db-app-common";

import type { ModelFor } from "../lib/modelTypes.js";

export class ConfigurationModel
  extends Model<
    InferAttributes<ConfigurationModel>,
    InferCreationAttributes<ConfigurationModel>
  >
  implements ModelFor<ConfigurationResource>
{
  @Attribute({
    type: DataTypes.INTEGER,
    autoIncrement: true,
    autoIncrementIdentity: true,
    primaryKey: true,
  })
  public declare id: CreationOptional<number>;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  public declare key: string;

  toResource(): ConfigurationResource {
    return new ConfigurationResource({
      key: this.key,
    });
  }
}
