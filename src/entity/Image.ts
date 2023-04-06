import { Column, Entity } from "typeorm";

import { EntityWithId } from "./EntityWithId.js";

@Entity()
export class Image extends EntityWithId {
  @Column("uuid", { generated: "uuid", unique: true, nullable: false })
  imageId!: string;

  @Column("text", {
    nullable: true,
    transformer: {
      from: (value: string) => new URL(value),
      to: (value: URL) => value.toString(),
    },
  })
  url!: string;

  @Column("text", {
    nullable: true,
    transformer: {
      from: (value: string) => Buffer.from(value, "base64"),
      to: (value: Buffer) => value.toString("base64"),
    },
    comment: "Small image or a thumbnail of the image reffered to by url",
  })
  imageData!: Buffer;

  @Column("integer")
  width!: number;

  @Column("integer")
  height!: number;
}
