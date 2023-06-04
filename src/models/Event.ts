import type {
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin,
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
  public declare uuid: CreationOptional<string>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  public declare title: string;

  public declare summary: string | null;

  public declare description: string | null;

  public declare location: string | null;

  public declare occurrences: CreationOptional<DateTime[]>;

  public declare duration: Duration | null;

  public declare images: NonAttribute<ImageResource[]>;
  public declare createImage: BelongsToManyCreateAssociationMixin<ImageModel>;
  public declare getImages: BelongsToManyGetAssociationsMixin<ImageModel>;
  public declare setImages: BelongsToManySetAssociationsMixin<
    ImageModel,
    ImageModel["id"]
  >;
  public declare addImage: BelongsToManyAddAssociationMixin<
    ImageModel,
    ImageModel["id"]
  >;
  public declare addImages: BelongsToManyAddAssociationsMixin<
    ImageModel,
    ImageModel["id"]
  >;
  public declare removeImage: BelongsToManyRemoveAssociationMixin<
    ImageModel,
    ImageModel["id"]
  >;
  public declare removeImages: BelongsToManyRemoveAssociationsMixin<
    ImageModel,
    ImageModel["id"]
  >;
  public declare hasImage: BelongsToManyHasAssociationMixin<
    ImageModel,
    ImageModel["id"]
  >;
  public declare hasImages: BelongsToManyHasAssociationsMixin<
    ImageModel,
    ImageModel["id"]
  >;
  public declare countImages: BelongsToManyCountAssociationsMixin<ImageModel>;
}

EventModel.init(
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
  }
);

EventModel.belongsToMany(ImageModel, {
  through: "event_images",
});

export class EventIntermediate implements WithToResource<EventResource> {
  public id?: number;
  public uuid?: string;
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date | null;
  public title?: string;
  public summary?: string | null;
  public description?: string | null;
  public location?: string | null;
  public occurrences?: DateTime[];
  public duration?: Duration | null;
  public images?: ImageResource[];

  constructor(model: Partial<EventModel>) {
    if (model.id !== undefined) this.id = model.id;
    if (model.uuid !== undefined) this.uuid = model.uuid;
    if (model.createdAt !== undefined) this.createdAt = model.createdAt;
    if (model.updatedAt !== undefined) this.updatedAt = model.updatedAt;
    if (model.deletedAt !== undefined) this.deletedAt = model.deletedAt;
    if (model.title !== undefined) this.title = model.title;
    if (model.summary !== undefined) this.summary = model.summary;
    if (model.description !== undefined) this.description = model.description;
  }

  public isComplete(): this is Required<EventIntermediate> {
    return (
      this.id !== undefined &&
      this.uuid !== undefined &&
      this.createdAt !== undefined &&
      this.updatedAt !== undefined &&
      this.deletedAt !== undefined &&
      this.title !== undefined &&
      this.summary !== undefined &&
      this.description !== undefined &&
      this.location !== undefined &&
      this.occurrences !== undefined &&
      this.duration !== undefined &&
      this.images !== undefined
    );
  }

  public toResource(): EventResource {
    if (!this.isComplete()) {
      throw new Error("Cannot convert incomplete Event to Resource");
    }

    return new EventResource({
      title: this.title,
      summary: this.summary,
      description: this.description,
      location: this.location,
      occurrences: this.occurrences,
      duration: this.duration,
      images: this.images,
      eventId: this.uuid,
    });
  }
}
