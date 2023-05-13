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
import { ImageResource } from "@ukdanceblue/db-app-common";

import { UrlDataType } from "../lib/customdatatypes/Url.js";
import type { WithToJsonFor } from "../lib/modelTypes.js";

import { EventModel } from "./Event.js";

@Table({
  tableName: "images",
})
export class ImageModel
  extends Model<
    InferAttributes<ImageModel>,
    InferCreationAttributes<ImageModel>
  >
  implements WithToJsonFor<ImageResource>
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
  public declare imageId: CreationOptional<string>;

  @Attribute({
    type: UrlDataType,
    allowNull: true,
  })
  public declare url: URL | null;

  @Attribute({
    type: DataTypes.BLOB,
    allowNull: true,
  })
  public declare imageData: Buffer | null;

  @Attribute({
    type: DataTypes.STRING(255), // The RFC guarantees a max of 127 characters on each side of the slash, making 255 the max length
    allowNull: true,
  })
  public declare mimeType: string | null;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: true,
  })
  public declare thumbHash: string | null;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: true,
  })
  public declare alt: string | null;

  @Attribute({
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  })
  public declare width: number;

  @Attribute({
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  })
  public declare height: number;

  // Places where images might be
  @BelongsToMany(() => EventModel, {
    through: "event_images",
  })
  private declare owningEvents: EventModel[]; // TODO rename from owning... (I don't like the word "owning" for this)

  public toResource(): ImageResource {
    return new ImageResource({
      imageId: this.imageId,
      url: this.url,
      imageData: this.imageData,
      mimeType: this.mimeType,
      thumbHash: this.thumbHash,
      alt: this.alt,
      width: this.width,
      height: this.height,
    });
  }
}
