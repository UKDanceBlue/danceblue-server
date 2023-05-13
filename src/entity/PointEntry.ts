import type { PointEntryResource } from "@ukdanceblue/db-app-common";
import { TeamType } from "@ukdanceblue/db-app-common";
import { Column, Entity, Index, ManyToOne } from "typeorm";

import type { EntityMethods } from "./Base.js";
import { EntityWithId } from "./Base.js";
import { Person } from "./Person.js";
import { Team } from "./Team.js";

@Entity()
export class PointEntry
  extends EntityWithId
  implements PointEntryResource, EntityMethods<PointEntryResource>
{
  @Index()
  @Column("uuid", { generated: "uuid", unique: true })
  entryId!: string;

  @Column({ type: "enum", enum: TeamType })
  type!: TeamType;

  @Column("text")
  description!: string;

  @Column("integer")
  points!: number;

  @ManyToOne(() => Person, (person) => person.pointEntries, { nullable: true })
  personFrom!: Person | null;

  @Index()
  @ManyToOne(() => Team, (team) => team.pointEntries)
  team!: Team;

  toResource(): PointEntryResource {
    return {
      entryId: this.entryId,
      type: this.type,
      description: this.description,
      points: this.points,
      personFrom: this.personFrom?.toResource() ?? null,
      team: this.team.toJson(),
    };
  }
}
