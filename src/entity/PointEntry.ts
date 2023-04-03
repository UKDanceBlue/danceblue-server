import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Person } from "./Person.js";
import { Team } from "./Team.js";
import { TeamType } from "./common.js";

@Entity()
export class PointEntry {
  @PrimaryGeneratedColumn("identity", { generatedIdentity: "ALWAYS" })
  id!: number;

  @Column("uuid", { generated: "uuid", unique: true, nullable: false })
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
