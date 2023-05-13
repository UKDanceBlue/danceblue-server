import type { ImageResource } from "@ukdanceblue/db-app-common";
import { Column, Entity, Index } from "typeorm";

import type { EntityMethods } from "./Base.js";
import { EntityWithId } from "./Base.js";

@Entity()
export class Image
  extends EntityWithId
  implements ImageResource, EntityMethods<ImageResource>
{
  @Index()
  @Column("uuid", { generated: "uuid", unique: true })
  imageId!: string;

  @Column("text", {
    nullable: true,
    transformer: {
      from: (value: string) => new URL(value),
      to: (value: URL) => value.toString(),
    },
  })
  url!: string | null;

  @Column("text", {
    nullable: true,
    transformer: {
      from: (value: string) => Buffer.from(value, "base64"),
      to: (value: Buffer) => value.toString("base64"),
    },
    comment: "Small image or a thumbnail of the image reffered to by url",
  })
  imageData!: Buffer | null;

  @Column("text", { nullable: true })
  mimeType!: string | null; // We could use this later to send WebPs or something dynamically

  @Column("text", { nullable: true })
  thumbHash!: string | null; // https://evanw.github.io/thumbhash/

  @Column("text", { nullable: true })
  alt!: string | null;

  @Column("integer")
  width!: number;

  @Column("integer")
  height!: number;

  toResource(): ImageResource {
    return {
      imageId: this.imageId,
      url: this.url,
      imageData: this.imageData,
      mimeType: this.mimeType,
      thumbHash: this.thumbHash,
      alt: this.alt,
      width: this.width,
      height: this.height,
    };
  }
}
