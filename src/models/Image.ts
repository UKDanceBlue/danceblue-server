import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import { ImageResource, arrayToBase64String } from "@ukdanceblue/db-app-common";

import { sequelizeDb } from "../data-source.js";
import { UrlDataType } from "../lib/customdatatypes/Url.js";
import type { WithToResource } from "../lib/modelTypes.js";

import { EventModel } from "./Event.js";

export class ImageModel extends Model<
  InferAttributes<ImageModel>,
  InferCreationAttributes<ImageModel>
> {
  public declare id: CreationOptional<number>;
  public declare uuid: CreationOptional<string>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  public declare url: URL | null;

  public declare imageData: Buffer | null;

  public declare mimeType: string | null;

  public declare thumbHash: Buffer | null;

  public declare alt: string | null;

  public declare width: number;

  public declare height: number;

  private declare eventWithImages: EventModel[];
}

ImageModel.init(
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
      index: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
    url: {
      type: UrlDataType,
      allowNull: true,
    },
    imageData: {
      type: DataTypes.BLOB,
      allowNull: true,
    },
    mimeType: {
      type: DataTypes.STRING(255), // The RFC guarantees a max of 127 characters on each side of the slash, making 255 the max length
      allowNull: true,
    },
    thumbHash: {
      type: DataTypes.BLOB,
      allowNull: true,
    },
    alt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    width: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    height: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeDb,
  }
);

ImageModel.belongsToMany(EventModel, {
  through: "event_images",
});

export class ImageIntermediate implements WithToResource<ImageResource> {
  public id?: number;
  public uuid?: string;
  public url?: URL | null;
  public imageData?: Buffer | null;
  public mimeType?: string | null;
  public thumbHash?: Buffer | null;
  public alt?: string | null;
  public width?: number;
  public height?: number;

  constructor(model: Partial<ImageModel>) {
    if (model.id) this.id = model.id;
    if (model.uuid) this.uuid = model.uuid;
    if (model.url) this.url = model.url;
    if (model.imageData) this.imageData = model.imageData;
    if (model.mimeType) this.mimeType = model.mimeType;
    if (model.thumbHash) this.thumbHash = model.thumbHash;
    if (model.alt) this.alt = model.alt;
    if (model.width) this.width = model.width;
    if (model.height) this.height = model.height;
  }

  public isComplete(): this is Required<ImageIntermediate> {
    return (
      this.id !== undefined &&
      this.uuid !== undefined &&
      this.url !== undefined &&
      this.imageData !== undefined &&
      this.mimeType !== undefined &&
      this.thumbHash !== undefined &&
      this.alt !== undefined &&
      this.width !== undefined &&
      this.height !== undefined
    );
  }

  public toResource(): ImageResource {
    if (this.isComplete()) {
      return new ImageResource({
        imageId: this.uuid,
        url: this.url,
        mimeType: this.mimeType,
        thumbHash:
          this.thumbHash === null ? null : arrayToBase64String(this.thumbHash),
        alt: this.alt,
        width: this.width,
        height: this.height,
      });
    } else {
      throw new Error("Image is not complete, cannot convert to resource");
    }
  }
}
