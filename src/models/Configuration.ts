import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import { ConfigurationResource } from "@ukdanceblue/db-app-common";

import { sequelizeDb } from "../data-source.js";
import type { WithToResource } from "../lib/modelTypes.js";

export class ConfigurationModel extends Model<
  InferAttributes<ConfigurationModel>,
  InferCreationAttributes<ConfigurationModel>
> {
  public declare id: CreationOptional<number>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  public declare key: string;
}

ConfigurationModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      autoIncrementIdentity: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize: sequelizeDb,
    tableName: "configuration",
    timestamps: false,
  }
);

export class ConfigurationIntermediate
  implements WithToResource<ConfigurationResource>
{
  public declare id: number;
  public declare key: string;

  public toResource(): ConfigurationResource {
    return new ConfigurationResource({
      key: this.key,
    });
  }
}
