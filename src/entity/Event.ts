import type { EventResource } from "@ukdanceblue/db-app-common";
import type { Interval } from "luxon";
import { Column, Entity, Index, JoinTable, ManyToMany } from "typeorm";

import { luxonIntervalPgRangeTransformer } from "../lib/transformers.js";

import type { EntityMethods } from "./Base.js";
import { EntityWithId } from "./Base.js";
import { Image } from "./Image.js";

@Entity()
export class Event
  extends EntityWithId
  implements EventResource, EntityMethods<EventResource>
{
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

  toJson(): EventResource {
    return {
      eventId: this.eventId,
      images: this.images.map((image) => image.toJson()),
      occurrences: this.occurrences,
      title: this.title,
      summary: this.summary,
      description: this.description,
      location: this.location,
    };
  }
}
