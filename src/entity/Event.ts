import type { EventResource } from "@ukdanceblue/db-app-common";
import type { Interval } from "luxon";
import { Column, Entity, Index, JoinTable, ManyToMany } from "typeorm";

import { luxonIntervalPgRangeTransformer } from "../lib/transformers.js";

import { EntityWithId } from "./EntityWithId.js";
import { Image } from "./Image.js";

@Entity()
export class Event extends EntityWithId implements EventResource {
  @Index()
  @Column("uuid", { generated: "uuid", unique: true })
  eventId!: string;

  @ManyToMany(() => Image)
  @JoinTable()
  images!: Image[];

  @Column("tstzrange", {
    transformer: luxonIntervalPgRangeTransformer,
    array: true,
  })
  occurrences!: Interval[];

  @Column("text")
  title!: string;

  @Column("text", { nullable: true })
  summary!: string | null;

  @Column("text", { nullable: true })
  description!: string | null;

  @Column("text", { nullable: true })
  location!: string | null;
}
