import type { ImageResource } from "@ukdanceblue/db-app-common";
import { Column, Entity } from "typeorm";

import { EntityWithId } from "./EntityWithId.js";

@Entity()
export class Image extends EntityWithId implements ImageResource {
  @Column("uuid", { generated: "uuid", unique: true, nullable: false })
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
}
