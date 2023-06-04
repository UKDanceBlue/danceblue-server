import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import { DbRole, TeamResource, TeamType } from "@ukdanceblue/db-app-common";

import { sequelizeDb } from "../data-source.js";
import type { WithToResource } from "../lib/modelTypes.js";

import type { PointEntryModel } from "./PointEntry.js";
import { PointEntryIntermediate } from "./PointEntry.js";

export class TeamModel extends Model<
  InferAttributes<TeamModel>,
  InferCreationAttributes<TeamModel>
> {
  public declare id: CreationOptional<number>;

  public declare uuid: CreationOptional<string>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  public declare name: string;

  public declare type: TeamType;

  public declare visibility: CreationOptional<DbRole>;

  // TODO: convert to a memberships table that also stores the captain status
  // public declare members: PersonModel[];

  // public declare captains: PersonModel[];

  public declare pointEntries: NonAttribute<PointEntryModel[]>;
}

TeamModel.init(
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
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(Object.values(TeamType)),
      allowNull: false,
    },
    visibility: {
      type: DataTypes.ENUM(Object.values(DbRole)),
      defaultValue: DbRole.None,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeDb,
    name: {
      singular: "team",
      plural: "teams",
    },
    modelName: "Team",
  }
);

export class TeamIntermediate implements WithToResource<TeamResource> {
  public id?: number;
  public uuid?: string;
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date | null;
  public name?: string;
  public type?: TeamType;
  public visibility?: DbRole;
  public pointEntries?: PointEntryIntermediate[];

  constructor(team: TeamModel) {
    this.id = team.id;
    this.uuid = team.uuid;
    this.createdAt = team.createdAt;
    this.updatedAt = team.updatedAt;
    this.deletedAt = team.deletedAt;
    this.name = team.name;
    this.type = team.type;
    this.visibility = team.visibility;
    this.pointEntries = team.pointEntries.map(
      (pe) => new PointEntryIntermediate(pe)
    );
  }

  public isComplete(): this is Required<TeamIntermediate> {
    return (
      this.id !== undefined &&
      this.uuid !== undefined &&
      this.createdAt !== undefined &&
      this.updatedAt !== undefined &&
      this.deletedAt !== undefined &&
      this.name !== undefined &&
      this.type !== undefined &&
      this.visibility !== undefined &&
      this.pointEntries !== undefined
    );
  }

  public toResource(): TeamResource {
    if (!this.isComplete()) {
      throw new Error("TeamIntermediate is not complete");
    }

    return new TeamResource({
      teamId: this.uuid,
      name: this.name,
      type: this.type,
      visibility: this.visibility,
      pointEntries: this.pointEntries.map((pe) => pe.toResource()),
      members: [],
      captains: [],
    });
  }
}
