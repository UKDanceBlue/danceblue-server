import { TeamType } from "@ukdanceblue/db-app-common";
import type { PointOpportunityResource } from "@ukdanceblue/db-app-common";
import type { DateTime } from "luxon";
import { Column, Entity, ManyToOne } from "typeorm";

import { luxonDateTimeJsDateTransformer } from "../lib/transformers.js";

import { EntityWithId } from "./EntityWithId.js";
import { Person } from "./Person.js";
import { Team } from "./Team.js";

@Entity()
export class PointOpportunity
  extends EntityWithId
  implements PointOpportunityResource
{
  @Column("uuid", { generated: "uuid", unique: true })
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
