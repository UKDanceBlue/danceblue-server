import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import type { ImageResource } from "@ukdanceblue/db-app-common";
import { EventResource } from "@ukdanceblue/db-app-common";
import type { DateTime, Duration } from "luxon";

import { sequelizeDb } from "../data-source.js";
import { DurationDataType } from "../lib/customdatatypes/Duration.js";
import { UtcDateTimeDataType } from "../lib/customdatatypes/UtcDateTime.js";
import type { WithToResource } from "../lib/modelTypes.js";

import { ImageModel } from "./Image.js";

export class EventModel extends Model<
  InferAttributes<EventModel>,
  InferCreationAttributes<EventModel>
> {
  public declare id: CreationOptional<number>;

  public declare eventId: CreationOptional<string>;

  public declare title: string;

  public declare summary: string | null;

  public declare description: string | null;

  public declare location: string | null;

  public declare occurrences: CreationOptional<DateTime[]>;

  public declare duration: Duration | null;

  public declare images: NonAttribute<ImageResource[]>;
}

EventModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      autoIncrementIdentity: true,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    occurrences: {
      type: DataTypes.ARRAY(UtcDateTimeDataType),
      allowNull: false,
      defaultValue: [],
    },
    duration: {
      type: DurationDataType,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeDb,
    modelName: "Event",
  }
);

EventModel.belongsToMany(ImageModel, {
  through: "event_images",
});

export class EventIntermediate implements WithToResource<EventResource> {
  public declare id: number;

  public declare eventId: string;

  public declare title: string;

  public declare summary: string | null;

  public declare description: string | null;

  public declare location: string | null;

  public declare occurrences: DateTime[];

  public declare duration: Duration | null;

  public declare images: ImageResource[];

  public toResource(): EventResource {
    return new EventResource({
      title: this.title,
      summary: this.summary,
      description: this.description,
      location: this.location,
      occurrences: this.occurrences,
      duration: this.duration,
      images: this.images,
      eventId: this.eventId,
    });
  }
}
