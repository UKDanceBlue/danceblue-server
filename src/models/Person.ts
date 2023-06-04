import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import type {
  AuthSource,
  RoleResourceInitializer,
  UserData,
} from "@ukdanceblue/db-app-common";
import {
  CommitteeRole,
  DbRole,
  PersonResource,
  RoleResource,
} from "@ukdanceblue/db-app-common";

import { sequelizeDb } from "../data-source.js";
import { roleToAuthorization } from "../lib/auth/role.js";
import type { WithToResource } from "../lib/modelTypes.js";

import type { TeamModel } from "./Team.js";
import { TeamIntermediate } from "./Team.js";

export class PersonModel extends Model<
  InferAttributes<PersonModel>,
  InferCreationAttributes<PersonModel>
> {
  public declare id: CreationOptional<number>;

  public declare uuid: CreationOptional<string>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  public declare firstName: string | null;

  public declare lastName: string | null;

  public declare email: string;

  public declare linkblue: string | null;

  public declare authIds: Partial<Record<AuthSource, string>>;

  public declare dbRole: CreationOptional<DbRole>;

  public declare committeeRole: CommitteeRole | null;

  public declare committeeName: string | null;

  public declare memberOf: NonAttribute<TeamModel[]>;

  public declare captainOf: NonAttribute<TeamModel[]>;
}

PersonModel.init(
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
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
    firstName: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    linkblue: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    authIds: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    dbRole: {
      type: DataTypes.ENUM(Object.values(DbRole)),
      allowNull: false,
      defaultValue: DbRole.None,
    },
    committeeRole: {
      type: DataTypes.ENUM(Object.values(CommitteeRole)),
      allowNull: true,
    },
    committeeName: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeDb,
    name: {
      singular: "person",
      plural: "people",
    },
    modelName: "Person",
  }
);

export class PersonIntermediate implements WithToResource<PersonResource> {
  public id?: number;
  public uuid?: string;
  public firstName?: string | null;
  public lastName?: string | null;
  public email?: string;
  public linkblue?: string | null;
  public authIds?: Partial<Record<AuthSource, string>>;
  public dbRole?: DbRole;
  public committeeRole?: CommitteeRole | null;
  public committeeName?: string | null;
  public memberOf?: TeamIntermediate[];
  public captainOf?: TeamIntermediate[];

  constructor(init: Partial<PersonModel>) {
    if (init.id !== undefined) this.id = init.id;
    if (init.uuid !== undefined) this.uuid = init.uuid;
    if (init.firstName !== undefined) this.firstName = init.firstName;
    if (init.lastName !== undefined) this.lastName = init.lastName;
    if (init.email !== undefined) this.email = init.email;
    if (init.linkblue !== undefined) this.linkblue = init.linkblue;
    if (init.authIds !== undefined) this.authIds = init.authIds;
    if (init.dbRole !== undefined) this.dbRole = init.dbRole;
    if (init.committeeRole !== undefined)
      this.committeeRole = init.committeeRole;
    if (init.committeeName !== undefined)
      this.committeeName = init.committeeName;
    if (init.memberOf !== undefined)
      this.memberOf = init.memberOf.map((t) => new TeamIntermediate(t));
    if (init.captainOf !== undefined)
      this.captainOf = init.captainOf.map((t) => new TeamIntermediate(t));
  }

  isComplete(): this is Required<PersonIntermediate> {
    return (
      this.firstName !== undefined &&
      this.lastName !== undefined &&
      this.email !== undefined &&
      this.linkblue !== undefined &&
      this.authIds !== undefined &&
      this.dbRole !== undefined &&
      this.committeeRole !== undefined &&
      this.committeeName !== undefined &&
      this.memberOf !== undefined &&
      this.captainOf !== undefined
    );
  }

  get role(): NonAttribute<RoleResource> {
    if (this.dbRole === undefined) {
      throw new Error("PersonIntermediate was not initialized with DB role");
    }

    const roleInit: RoleResourceInitializer = {
      dbRole: this.dbRole,
    };
    if (this.committeeRole !== undefined)
      roleInit.committeeRole = this.committeeRole;
    if (this.committeeName !== undefined)
      roleInit.committee = this.committeeName;
    return new RoleResource(roleInit);
  }

  toResource(): PersonResource {
    if (!this.isComplete()) {
      throw new Error("PersonIntermediate is not complete");
    }

    return new PersonResource({
      userId: this.uuid,
      firstName: this.firstName,
      lastName: this.lastName,
      authIds: this.authIds,
      email: this.email,
      linkblue: this.linkblue,
      memberOf: this.memberOf.map((team) => team.toResource()),
      captainOf: this.captainOf.map((team) => team.toResource()),
      pointEntries: [],
      role: this.role,
    });
  }

  toUserData(): UserData {
    if (this.uuid === undefined) {
      throw new Error("PersonIntermediate was not initialized with UUID");
    }
    if (this.memberOf === undefined) {
      throw new Error("PersonIntermediate was not initialized with memberOf");
    }
    if (this.captainOf === undefined) {
      throw new Error("PersonIntermediate was not initialized with captainOf");
    }
    const userData: UserData = {
      userId: this.uuid,
      auth: roleToAuthorization(this.role),
    };
    userData.teamIds = this.memberOf.map((team) => team.uuid!);
    userData.captainOfTeamIds = this.captainOf.map((team) => team.uuid!);
    return userData;
  }
}
