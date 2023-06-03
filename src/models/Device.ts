import type {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import {} from "@ukdanceblue/db-app-common";
import type { DateTime } from "luxon";

import { sequelizeDb } from "../data-source.js";
import { UtcDateTimeDataType } from "../lib/customdatatypes/UtcDateTime.js";
import type { WithToResource } from "../lib/modelTypes.js";

import { PersonModel } from "./Person.js";

export class DeviceModel extends Model<
  InferAttributes<DeviceModel>,
  InferCreationAttributes<DeviceModel>
> {
  declare id: CreationOptional<number>;

  declare deviceId: CreationOptional<string>;

  declare expoPushToken: string | null;

  declare createLastUser: BelongsToCreateAssociationMixin<PersonModel>;
  declare getLastUser: BelongsToGetAssociationMixin<PersonModel>;
  declare lastUser: NonAttribute<PersonModel | null>;
  declare lastUserId: ForeignKey<PersonModel["id"]> | null;

  declare lastLogin: DateTime | null;

  declare static associations: {
    lastUser: Association<DeviceModel, PersonModel>;
  };
}

DeviceModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      autoIncrementIdentity: true,
      primaryKey: true,
    },
    deviceId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      index: true,
    },
    expoPushToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        is: /^Expo(nent)?PushToken\[.{23}]$/,
      },
    },
    lastLogin: {
      type: UtcDateTimeDataType,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeDb,
    tableName: "device",
    timestamps: true,
    updatedAt: false,
  }
);

DeviceModel.belongsTo(PersonModel, {
  as: "lastUser",
  foreignKey: "lastUserId",
});

export class DeviceIntermediate implements WithToResource<never> {
  public declare id: number;

  public declare deviceId: string;

  public declare expoPushToken: string | null;

  public declare lastUser: PersonModel | null;

  public declare lastLogin: DateTime | null;

  public toResource(): never {
    return {} as never;
  }
}
