import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Image {
  @PrimaryGeneratedColumn("identity", { generatedIdentity: "ALWAYS" })
    id!: number;

  @Column("uuid", { generated: "uuid", unique: true, nullable: false })
    imageId!: string;

  @Column("text", { nullable: true, transformer: { from: (value: string) => new URL(value), to: (value: URL) => value.toString() } })
    url!: string;

  @Column("text", { nullable: true, transformer: { from: (value: string) => Buffer.from(value, "base64"), to: (value: Buffer) => value.toString("base64") }, comment: "Small image or a thumbnail of the image reffered to by url" })
    imageData!: Buffer;
  
  @Column("integer")
    width!: number;

  @Column("integer")
    height!: number;
}
