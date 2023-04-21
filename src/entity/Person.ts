import type {
  AuthSource,
  PersonResource,
  UserData,
} from "@ukdanceblue/db-app-common";
import { IsEmail } from "class-validator";
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";

import { EntityWithId } from "./EntityWithId.js";
import { PointEntry } from "./PointEntry.js";
import { Role } from "./Role.js";
import { Team } from "./Team.js";

@Entity()
export class Person extends EntityWithId implements PersonResource {
  @Column("uuid", { generated: "uuid", unique: true })
  userId!: string;

  /**
   * This is usually either a random uuid, or the oid claim from the OIDC id_token, depending on the auth source
   */
  @Column({ type: "jsonb", default: {} })
  authIds: Partial<Record<AuthSource, string>> = {};

  @Column("text", { nullable: true })
  firstName!: string;

  @Column("text", { nullable: true })
  lastName!: string;

  @Column("text")
  @IsEmail()
  email!: string;

  @Column("text", { nullable: true })
  linkblue!: string;

  @Column(() => Role)
  role!: Role;

  @ManyToMany(() => Team, (team) => team.members)
  @JoinTable()
  memberOf?: Team[];

  @ManyToMany(() => Team, (team) => team.captains)
  @JoinTable()
  captainOf?: Team[];

  @OneToMany(() => PointEntry, (pointEntry) => pointEntry.personFrom)
  pointEntries?: PointEntry[];

  toUser(): UserData {
    const userData: UserData = {
      userId: this.userId,
      auth: this.role.toAuthorization(),
    };
    if (this.memberOf) {
      userData.teamIds = this.memberOf.map((team) => team.teamId);
    }
    if (this.captainOf) {
      userData.captainOfTeamIds = this.captainOf.map((team) => team.teamId);
    }
    return userData;
  }
}
