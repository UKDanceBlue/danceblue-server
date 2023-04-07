import { DateTime, Interval } from "luxon";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";

import { luxonDateTimeJsDateTransformer } from "../lib/transformers.js";

import { EntityWithId } from "./EntityWithId.js";
import { Image } from "./Image.js";

@Entity()
export class Event extends EntityWithId {
  @Column("uuid", { generated: "uuid", unique: true, nullable: false })
  eventId!: string;

  @ManyToMany(() => Image)
  @JoinTable()
  images!: Image[];

  @Column("timestamptz", {
    transformer: luxonDateTimeJsDateTransformer,
    array: true,
    nullable: true,
  })
  start!: DateTime[];

  @Column("timestamptz", {
    transformer: luxonDateTimeJsDateTransformer,
    array: true,
    nullable: true,
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
  summary!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column("text", { nullable: true })
  location!: string;
}
