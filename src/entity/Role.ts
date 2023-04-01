/* eslint-disable no-fallthrough */
import { Column } from "typeorm";

import { AccessLevel, Authorization } from "../lib/auth.js";

export enum DbRole {
  None = "none",
  Public = "public",
  TeamMember = "team-member",
  TeamCaptain = "team-captain",
  Committee = "committee"
}

export enum CommitteeRole {
  Chair = "chair",
  Coordinator = "coordinator",
  Member = "member"
}

export class Role {
  @Column("enum", { enum: DbRole, default: DbRole.None })
    dbRole!: DbRole;

  @Column("enum", { nullable: true, enum: CommitteeRole })
    committeeRole!: CommitteeRole | null;
  
  @Column("text", { nullable: true })
    committee!: string | null;

  toAuthorization(): Authorization {
    let accessLevel: AccessLevel = AccessLevel.Base;
    switch (this.dbRole) {
    case DbRole.Committee:
      accessLevel = AccessLevel.Committee;
      break;
    case DbRole.TeamCaptain:
      accessLevel = AccessLevel.TeamCaptain;
      break;
    case DbRole.TeamMember:
      accessLevel = AccessLevel.TeamMember;
      break;
    case DbRole.Public:
      accessLevel = AccessLevel.Public;
      break;
    case DbRole.None:
      accessLevel = AccessLevel.Base;
      break;
    default:
      accessLevel = AccessLevel.Base;
      break;
    }
    if (this.committeeRole === CommitteeRole.Chair || this.committee === "tech-committee") {
      accessLevel = AccessLevel.Admin;
    }

    const auth: Authorization = {
      dbRole: this.dbRole,
      accessLevel
    };

    if (this.committeeRole && this.committee) {
      auth.committeeRole = this.committeeRole;
      auth.committee = this.committee;
    } else if (this.committee || this.committeeRole) {
      throw new Error("Cannot have a committee role without a committee or vice versa");
    }

    return auth;
  }
}
