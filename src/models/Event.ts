import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import { Attribute, Table } from "@sequelize/core/decorators-legacy";
import type { EventResource, ImageResource } from "@ukdanceblue/db-app-common";
import type { Interval } from "luxon";

import { UtcRangeDataType } from "../lib/customdatatypes/UtcRange.js";
import type { WithToJsonFor } from "../lib/modelTypes.js";

@Table({
  tableName: "events",
})
export class EventModel
  extends Model<
    InferAttributes<EventModel>,
    InferCreationAttributes<EventModel>
  >
  implements WithToJsonFor<EventResource>
{
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
  })
  public declare eventId: CreationOptional<string>;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  public declare title: string;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: true,
  })
  public declare summary: string | null;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: true,
  })
  public declare description: string | null;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: true,
  })
  public declare location: string | null;

  @Attribute({
    type: DataTypes.ARRAY(UtcRangeDataType),
    allowNull: false,
  })
  public declare occurrences: CreationOptional<Interval[]>;

  @Attribute({
    type: DataTypes.JSON,
    allowNull: false,
  })
  public declare images: CreationOptional<ImageResource[]>;

  toResource(): EventResource {
    return {
      eventId: this.eventId,
      title: this.title,
      summary: this.summary,
      description: this.description,
      location: this.location,
      occurrences: this.occurrences,
      images: this.images,
    };
  }
}
