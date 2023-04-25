import type { CreationOptional } from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import { Attribute, Table } from "@sequelize/core/decorators-legacy";
import type { ImageResource } from "@ukdanceblue/db-app-common";

import type { WithToJsonFor } from "../lib/modelTypes.js";

@Table({
  tableName: "images",
})
export class ImageModel extends Model implements WithToJsonFor<ImageResource> {
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
  public declare imageId: string;

  @Attribute({
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue("url") as unknown;
      return typeof value === "string" ? new URL(value) : null;
    },
    set(value: URL | null) {
      this.setDataValue("url", value?.toString() ?? null);
    },
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

  public toJson(): ImageResource {
    return {
      imageId: this.imageId,
      url: this.url?.toString() ?? null,
      imageData: this.imageData,
      mimeType: this.mimeType,
      thumbHash: this.thumbHash,
      alt: this.alt,
      width: this.width,
      height: this.height,
    };
  }
}
