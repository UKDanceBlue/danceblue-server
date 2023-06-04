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
  declare uuid: CreationOptional<string>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

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
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
      index: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
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
    paranoid: false,
  }
);

DeviceModel.belongsTo(PersonModel, {
  as: "lastUser",
  foreignKey: "lastUserId",
});

export class DeviceIntermediate implements WithToResource<never> {
  public id: number;
  public uuid: string;

  public expoPushToken: string | null;

  public lastUser: PersonModel | null;

  public lastLogin: DateTime | null;

  constructor(device: DeviceModel) {
    this.id = device.id;
    this.uuid = device.uuid;
    this.expoPushToken = device.expoPushToken;
    this.lastUser = device.lastUser;
    this.lastLogin = device.lastLogin;
  }

  public toResource(): never {
    return {} as never;
  }
}
