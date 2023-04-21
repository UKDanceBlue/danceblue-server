import { TeamType } from "@ukdanceblue/db-app-common";
import type { PointOpportunityResource } from "@ukdanceblue/db-app-common";
import type { DateTime } from "luxon";
import { Column, Entity, Index, ManyToOne } from "typeorm";

import { luxonDateTimeJsDateTransformer } from "../lib/transformers.js";

import type { EntityMethods } from "./Base.js";
import { EntityWithId } from "./Base.js";
import { Person } from "./Person.js";
import { Team } from "./Team.js";

@Entity()
export class PointOpportunity
  extends EntityWithId
  implements PointOpportunityResource, EntityMethods<PointOpportunityResource>
{
  @Index()
  @Column("uuid", { generated: "uuid", unique: true })
  entryId!: string;

  @Column({ type: "enum", enum: TeamType })
  type!: TeamType;

  @Column("text")
  name!: string;

  // Probably want an index or something on this
  @Column("timestamptz", {
    nullable: true,
    transformer: luxonDateTimeJsDateTransformer,
  })
  opportunityDate!: DateTime | null;

  @ManyToOne(() => Person, (person) => person.pointEntries, { nullable: true })
  personFrom!: Person | null;

  @ManyToOne(() => Team, (team) => team.pointEntries)
  team!: Team;

  toJson(): PointOpportunityResource {
    return {
      entryId: this.entryId,
      type: this.type,
      name: this.name,
      opportunityDate: this.opportunityDate,
      personFrom: this.personFrom?.toJson() ?? null,
      team: this.team.toJson(),
    };
  }
}
