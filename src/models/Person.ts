import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import {
  Attribute,
  BelongsToMany,
  Table,
} from "@sequelize/core/decorators-legacy";
import type {
  AuthSource,
  PersonResource,
  RoleResource,
  UserData,
} from "@ukdanceblue/db-app-common";
import { CommitteeRole, DbRole } from "@ukdanceblue/db-app-common";

import { roleToAuthorization } from "../lib/auth/role.js";
import type { WithToJsonFor } from "../lib/modelTypes.js";

import { TeamModel } from "./Team.js";

@Table({
  tableName: "people",
})
export class PersonModel
  extends Model<
    InferAttributes<PersonModel>,
    InferCreationAttributes<PersonModel>
  >
  implements WithToJsonFor<PersonResource>
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
  public declare userId: CreationOptional<string>;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: true,
  })
  public declare firstName: string | null;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: true,
  })
  public declare lastName: string | null;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  })
  public declare email: string;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: true,
  })
  public declare linkblue: string | null;

  @Attribute({
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  })
  public declare authIds: Partial<Record<AuthSource, string>>;

  @Attribute({
    type: DataTypes.ENUM(Object.values(DbRole)),
    allowNull: false,
    defaultValue: DbRole.None,
  })
  public declare dbRole: CreationOptional<DbRole>;

  @Attribute({
    type: DataTypes.ENUM(Object.values(CommitteeRole)),
    allowNull: true,
  })
  public declare committeeRole: CommitteeRole | null;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: true,
  })
  public declare committeeName: string | null;

  @BelongsToMany(() => TeamModel, {
    through: "team_members",
    inverse: {
      as: "members",
    },
  })
  public declare memberOf: CreationOptional<TeamModel[]>;

  @BelongsToMany(() => TeamModel, {
    through: "team_Captains",
    inverse: {
      as: "captains",
    },
  })
  public declare captainOf: CreationOptional<TeamModel[]>;

  get role(): CreationOptional<RoleResource> {
    return {
      committee: this.committeeName,
      committeeRole: this.committeeRole,
      dbRole: this.dbRole,
    };
  }

  toResource(): PersonResource {
    return {
      userId: this.userId,
      firstName: this.firstName,
      lastName: this.lastName,
      authIds: this.authIds,
      email: this.email,
      linkblue: this.linkblue,
      memberOf: this.memberOf.map((team) => team.toResource()),
      captainOf: this.captainOf.map((team) => team.toResource()),
      pointEntries: [],
      role: this.role,
    };
  }

  toUserData(): UserData {
    const userData: UserData = {
      userId: this.userId,
      auth: roleToAuthorization(this.role),
    };
    userData.teamIds = this.memberOf.map((team) => team.teamId as string);
    userData.captainOfTeamIds = this.captainOf.map(
      (team) => team.teamId as string
    );
    return userData;
  }
}
