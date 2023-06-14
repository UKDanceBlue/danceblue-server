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
import type { Duration } from "luxon";
import { DateTime } from "luxon";

import { sequelizeDb } from "../data-source.js";
import { DurationDataType } from "../lib/customdatatypes/Duration.js";
import { IntermediateClass } from "../lib/modelTypes.js";

import type { ImageModel } from "./Image.js";
import type { CoreProperty, ImportantProperty } from "./intermediate.js";

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

  public declare occurrences: CreationOptional<Date[]>;

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
    // TODO: move occurrences to own table
    occurrences: {
      type: DataTypes.ARRAY(DataTypes.DATE),
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
    name: {
      singular: "event",
      plural: "events",
    },
    modelName: "Event",
  }
);

export class EventIntermediate extends IntermediateClass<
  EventResource,
  EventIntermediate
> {
  public id?: CoreProperty<number>;
  public uuid?: CoreProperty<string>;
  public title?: ImportantProperty<string>;
  public summary?: string | null;
  public description?: string | null;
  public location?: string | null;
  public occurrences?: ImportantProperty<Date[]>;
  public duration?: Duration | null;
  public images?: ImageResource[] | string[];

  constructor(model: Partial<EventModel>) {
    super(["id", "uuid"], ["title", "occurrences"]);
    if (model.id !== undefined) this.id = model.id;
    if (model.uuid !== undefined) this.uuid = model.uuid;
    if (model.title !== undefined) this.title = model.title;
    if (model.summary !== undefined) this.summary = model.summary;
    if (model.description !== undefined) this.description = model.description;
    if (model.location !== undefined) this.location = model.location;
    if (model.occurrences !== undefined) this.occurrences = model.occurrences;
    if (model.duration !== undefined) this.duration = model.duration;
    if (model.images !== undefined) this.images = model.images;
  }

  public toResource(): EventResource {
    if (!this.hasImportantProperties()) {
      throw new Error("Cannot convert incomplete Event to Resource");
    }

    return new EventResource({
      title: this.title,
      summary: this.summary ?? null,
      description: this.description ?? null,
      location: this.location ?? null,
      occurrences: this.occurrences.map((date) => DateTime.fromJSDate(date)),
      duration: this.duration ?? null,
      images: this.images ?? null,
      eventId: this.uuid,
    });
  }
}
