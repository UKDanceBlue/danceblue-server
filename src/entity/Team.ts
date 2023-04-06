import { Column, Entity, ManyToMany, OneToMany } from "typeorm";

import { EntityWithId } from "./EntityWithId.js";
import { Person } from "./Person.js";
import { PointEntry } from "./PointEntry.js";
import { Role } from "./Role.js";
import { TeamType } from "./common.js";

@Entity()
export class Team extends EntityWithId {
  @Column("uuid", { generated: "uuid", unique: true, nullable: false })
  teamId!: string;

  @Column("text")
  name!: string;

  @Column({ type: "enum", enum: TeamType })
  type!: TeamType;

  @Column(() => Role)
  visibility!: Role;

  @ManyToMany(() => Person, (user) => user.memberOf)
  members!: Person[];

  @ManyToMany(() => Person, (user) => user.captainOf)
  captains!: Person[];

  @OneToMany(() => PointEntry, (pointEntry) => pointEntry.team)
  pointEntries!: PointEntry[];
}
