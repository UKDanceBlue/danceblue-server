import type { EventResource } from "@ukdanceblue/db-app-common";
import type { DateTime } from "luxon";
import { Interval } from "luxon";
import { Column, Entity, Index, JoinTable, ManyToMany } from "typeorm";

import { luxonDateTimeJsDateArrayTransformer } from "../lib/transformers.js";

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

  @Column("timestamptz", {
    transformer: luxonDateTimeJsDateArrayTransformer,
    array: true,
  })
  start!: DateTime[];

  @Column("timestamptz", {
    transformer: luxonDateTimeJsDateArrayTransformer,
    array: true,
  })
  end!: DateTime[];

  get intervals(): Interval[] {
    if (this.start.length !== this.end.length) {
      throw new Error("Start and end DateTime arrays have different lengths");
    }
    return this.start.map((start, index) => {
      const end = this.end[index];
      if (!end) {
        throw new Error("End DateTime is undefined");
      }
      return Interval.fromDateTimes(start, end);
    });
  }

  @Column("text")
  title!: string;

  @Column("text", { nullable: true })
  summary!: string | null;

  @Column("text", { nullable: true })
  description!: string | null;

  @Column("text", { nullable: true })
  location!: string | null;
}
