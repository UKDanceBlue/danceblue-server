import { DateTime } from "luxon";
import { Column, Entity, ManyToOne } from "typeorm";

import { luxonDateTimeJsDateTransformer } from "../lib/transformers.js";

import { EntityWithId } from "./EntityWithId.js";
import { Person } from "./Person.js";
import { Team } from "./Team.js";
import { TeamType } from "./common.js";

@Entity()
export class PointOpportunity extends EntityWithId {
  @Column("uuid", { generated: "uuid", unique: true, nullable: false })
  entryId!: string;

  @Column({ type: "enum", enum: TeamType })
  type!: TeamType;

  @Column("text")
  name!: string;

  @Column("timestamptz", {
    nullable: true,
    transformer: luxonDateTimeJsDateTransformer,
  })
  opportunityDate!: DateTime | null;

  @ManyToOne(() => Person, (person) => person.pointEntries, { nullable: true })
  personFrom!: Person | null;

  @ManyToOne(() => Team, (team) => team.pointEntries)
  team!: Team;
}
