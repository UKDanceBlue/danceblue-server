import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import { Attribute, BelongsTo, Table } from "@sequelize/core/decorators-legacy";
import { PointEntryResource, TeamType } from "@ukdanceblue/db-app-common";

import type { ModelFor } from "../lib/modelTypes.js";

import { PersonModel } from "./Person.js";
import { TeamModel } from "./Team.js";

export class PointEntryModel
  extends Model<
    InferAttributes<PointEntryModel>,
    InferCreationAttributes<PointEntryModel>
  >
  implements ModelFor<PointEntryResource>
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
  public declare entryId: CreationOptional<string>;

  @Attribute({
    type: DataTypes.ENUM(Object.values(TeamType)),
    allowNull: false,
  })
  public declare type: TeamType;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  public declare comment: string;

  @Attribute({
    type: DataTypes.INTEGER,
    allowNull: false,
  })
  public declare points: number;

  @BelongsTo(() => PersonModel, {
    foreignKey: {
      name: "personFromId",
      allowNull: true,
    },
  })
  public declare personFrom: PersonModel | null;
  public declare personFromId: number | null;

  @BelongsTo(() => TeamModel, {
    foreignKey: {
      name: "teamId",
      allowNull: false,
    },
  })
  public declare team: TeamModel;
  public declare teamId: number;

  toResource(): PointEntryResource {
    return new PointEntryResource({
      entryId: this.entryId,
      type: this.type,
      comment: this.comment,
      points: this.points,
      personFrom: this.personFrom?.toResource() ?? null,
      team: this.team.toResource(),
    });
  }
}
