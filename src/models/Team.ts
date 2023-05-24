import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import { Attribute, HasMany } from "@sequelize/core/decorators-legacy";
import { DbRole, TeamResource, TeamType } from "@ukdanceblue/db-app-common";

import type { ModelFor } from "../lib/modelTypes.js";

import type { PersonModel } from "./Person.js";
import { PointEntryModel } from "./PointEntry.js";

export class TeamModel
  extends Model<InferAttributes<TeamModel>, InferCreationAttributes<TeamModel>>
  implements ModelFor<TeamResource>
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
  })
  public declare teamId: CreationOptional<string>;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  public declare name: string;

  @Attribute({
    type: DataTypes.ENUM(Object.values(TeamType)),
    allowNull: false,
  })
  public declare type: TeamType;

  @Attribute({
    type: DataTypes.ENUM(Object.values(DbRole)),
    defaultValue: DbRole.None,
    allowNull: false,
  })
  public declare visibility: CreationOptional<DbRole>;

  public declare people: PersonModel[];

  public declare captains: PersonModel[];

  @HasMany(() => PointEntryModel, "teamId")
  public declare pointEntries: PointEntryModel[];

  toResource(): TeamResource {
    return new TeamResource({
      teamId: this.teamId,
      name: this.name,
      type: this.type,
      visibility: this.visibility,
      members: this.people.map((person) => person.toResource()),
      captains: this.captains.map((captain) => captain.toResource()),
      pointEntries: this.pointEntries.map((entry) => entry.toResource()),
    });
  }
}
