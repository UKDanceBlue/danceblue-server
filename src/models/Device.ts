import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import { Attribute, BelongsTo, Table } from "@sequelize/core/decorators-legacy";
import type { DeviceResource } from "@ukdanceblue/db-app-common";
import type {DateTime} from "luxon";

import { UtcDateTimeDataType } from "../lib/customdatatypes/UtcDateTime.js";
import type { WithToJsonFor } from "../lib/modelTypes.js";

import { PersonModel } from "./Person.js";

// @Table({
//   tableName: "",
// })
// export class ModelName
//   extends Model<InferAttributes<ModelName>, InferCreationAttributes<ModelName>>
//   implements WithToJsonFor<ResourceName> {}

@Table({
  tableName: "devices",
})
export class DeviceModel
extends Model<
  InferAttributes<DeviceModel>,
  InferCreationAttributes<DeviceModel>
>
implements WithToJsonFor<DeviceResource> {
  @Attribute({
    type: DataTypes.INTEGER,
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
      is: /^Expo(nent)?PushToken\[.{23}]$/
    }
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

  toResource(): DeviceResource {
    return {
      deviceId: this.deviceId,
      expoPushToken: this.expoPushToken,
      lastUser: this.lastUser?.toResource() ?? null,
      lastLogin: this.lastLogin ?? null,
    };
  } 
}