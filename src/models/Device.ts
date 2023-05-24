import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import { Attribute, BelongsTo } from "@sequelize/core/decorators-legacy";
import {} from "@ukdanceblue/db-app-common";
import type { DateTime } from "luxon";

import { UtcDateTimeDataType } from "../lib/customdatatypes/UtcDateTime.js";
import type { ModelFor } from "../lib/modelTypes.js";

import { PersonModel } from "./Person.js";

// @Table({
//   tableName: "",
// })
// export class ModelName
//   extends Model<InferAttributes<ModelName>, InferCreationAttributes<ModelName>>
//   implements WithToJsonFor<ResourceName> {}

export class DeviceModel
  extends Model<
    InferAttributes<DeviceModel>,
    InferCreationAttributes<DeviceModel>
  >
  implements ModelFor<never>
{
  @Attribute({
    type: DataTypes.INTEGER,
    autoIncrement: true,
    autoIncrementIdentity: true,
    primaryKey: true,
  })
  public declare id: CreationOptional<number>;

  @Attribute({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
    index: true,
  })
  public declare deviceId: CreationOptional<string>;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      is: /^Expo(nent)?PushToken\[.{23}]$/,
    },
  })
  public declare expoPushToken: string | null;

  @BelongsTo(() => PersonModel, {
    targetKey: "userId",
  })
  public declare lastUser: PersonModel | null;

  @Attribute({
    type: UtcDateTimeDataType,
    allowNull: true,
  })
  public declare lastLogin: DateTime | null;

  toResource(): never {
    // return new DeviceResource({
    //   deviceId: this.deviceId,
    //   expoPushToken: this.expoPushToken,
    //   lastUser: this.lastUser?.toResource() ?? null,
    //   lastLogin: this.lastLogin ?? null,
    // });
    throw new Error("Not implemented");
  }
}
