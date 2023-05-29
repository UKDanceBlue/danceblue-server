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
import type { ImageResource } from "@ukdanceblue/db-app-common";
import { EventResource } from "@ukdanceblue/db-app-common";
import type { DateTime, Duration } from "luxon";

import { DurationDataType } from "../lib/customdatatypes/Duration.js";
import { UtcDateTimeDataType } from "../lib/customdatatypes/UtcDateTime.js";
import type { ModelFor } from "../lib/modelTypes.js";

import { ImageModel } from "./Image.js";

@Table({
  defaultScope: {
    order: [["title", "ASC"]],
  },
})
export class EventModel
  extends Model<
    InferAttributes<EventModel>,
    InferCreationAttributes<EventModel>
  >
  implements ModelFor<EventResource>
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
    type: DataTypes.ARRAY(UtcDateTimeDataType),
    allowNull: false,
    defaultValue: [],
  })
  public declare occurrences: CreationOptional<DateTime[]>;

  @Attribute({
    type: DurationDataType,
    allowNull: true,
  })
  public declare duration: Duration | null;

  @BelongsToMany(() => ImageModel, {
    through: "event_images",
  })
  public declare images: CreationOptional<ImageResource[]>;

  toResource(): EventResource {
    return new EventResource({
      eventId: this.eventId,
      title: this.title,
      summary: this.summary,
      description: this.description,
      location: this.location,
      occurrences: this.occurrences,
      duration: this.duration,
      images: this.images,
    });
  }
}
