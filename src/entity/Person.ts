import { IsEmail } from "class-validator";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { User } from "../lib/auth.js";

import { PointEntry } from "./PointEntry.js";
import { Role } from "./Role.js";
import { Team } from "./Team.js";

@Entity()
export class Person {
    @PrimaryGeneratedColumn("identity")
      id!: number;

    @Column("uuid", { generated: "uuid", unique: true, nullable: false })
      userId!: string;

    @Column("text")
      firstName!: string;

    @Column("text")
      lastName!: string;

    @Column("text")
    @IsEmail()
      email!: string;

    @Column("text")
      linkblue!: string;
    
    @Column(() => Role)
      role!: Role;
    
    @ManyToMany(() => Team, (team) => team.members)
    @JoinTable()
      memberOf!: Team[];

    @ManyToMany(() => Team, (team) => team.captains)
    @JoinTable()
      captainOf!: Team[];
      
    @OneToMany(() => PointEntry, (pointEntry) => pointEntry.personFrom)
      pointEntries!: PointEntry[];
    
    toUser(): User {
      return {
        auth: this.role.toAuthorization(),
        id: this.userId,
        teamIds: this.memberOf.map((team) => team.teamId),
        captainOfTeamIds: this.captainOf.map((team) => team.teamId)
      };
    }
}
