import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import { Attribute } from "@sequelize/core/decorators-legacy";
import { LoginFlowSessionResource } from "@ukdanceblue/db-app-common";
import { DateTime } from "luxon";
import { generators } from "openid-client";

import type { ModelFor } from "../lib/modelTypes.js";

export class LoginFlowSessionModel
  extends Model<
    InferAttributes<LoginFlowSessionModel>,
    InferCreationAttributes<LoginFlowSessionModel>
  >
  implements ModelFor<LoginFlowSessionResource>
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
  })
  public declare sessionId: CreationOptional<string>;

  @Attribute({
    type: DataTypes.STRING(128),
    defaultValue: () => generators.codeVerifier(128),
  })
  codeVerifier!: CreationOptional<string>;

  @Attribute({
    type: DataTypes.TEXT, // Not necessarily a full URL, could be just a path
    allowNull: false,
  })
  redirectToAfterLogin!: string | null;

  // Timestamps
  declare readonly createdAt: CreationOptional<Date>;

  toResource(): LoginFlowSessionResource {
    return new LoginFlowSessionResource({
      sessionId: this.sessionId,
      codeVerifier: this.codeVerifier,
      creationDate: DateTime.fromJSDate(this.createdAt),
      redirectToAfterLogin: this.redirectToAfterLogin,
    });
  }
}
