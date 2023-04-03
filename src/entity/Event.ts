import { DateTime } from "luxon";
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { luxonDateTimeJsDateTransformer } from "../lib/transformers.js";

import { Image } from "./Image.js";

@Entity()
export class Event {
  @PrimaryGeneratedColumn("identity", { generatedIdentity: "ALWAYS" })
  id!: number;

  @Column("uuid", { generated: "uuid", unique: true, nullable: false })
  eventId!: string;

  @ManyToMany(() => Image)
  @JoinTable()
  images!: Image[];

  @Column("timestamptz", { transformer: luxonDateTimeJsDateTransformer })
  start!: DateTime;

  @Column("timestamptz", { transformer: luxonDateTimeJsDateTransformer })
  end!: DateTime;

  @Column("text")
  title!: string;

  @Column("text", { nullable: true })
  shortDescription!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column("text", { nullable: true })
  location!: string;
}
