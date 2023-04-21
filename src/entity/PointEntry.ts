import type { PointEntryResource } from "@ukdanceblue/db-app-common";
import { TeamType } from "@ukdanceblue/db-app-common";
import { Column, Entity, ManyToOne } from "typeorm";

import { EntityWithId } from "./EntityWithId.js";
import { Person } from "./Person.js";
import { Team } from "./Team.js";

@Entity()
export class PointEntry extends EntityWithId implements PointEntryResource {
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

  @ManyToOne(() => Team, (team) => team.pointEntries)
  team!: Team;
}
