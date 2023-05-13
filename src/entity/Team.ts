import { TeamType } from "@ukdanceblue/db-app-common";
import type { TeamResource } from "@ukdanceblue/db-app-common";
import { Column, Entity, Index, ManyToMany, OneToMany } from "typeorm";

import { EntityWithId } from "./Base.js";
import { Person } from "./Person.js";
import { PointEntry } from "./PointEntry.js";
import { Role } from "./Role.js";

@Entity()
export class Team extends EntityWithId implements TeamResource {
  @Index()
  @Column("uuid", { generated: "uuid", unique: true })
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

  toJson(): TeamResource {
    return {
      teamId: this.teamId,
      name: this.name,
      type: this.type,
      visibility: this.visibility,
      members: this.members.map((member) => member.toResource()),
      captains: this.captains.map((captain) => captain.toResource()),
      pointEntries: this.pointEntries.map((pointEntry) =>
        pointEntry.toResource()
      ),
    };
  }
}
