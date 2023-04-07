/* eslint-disable no-fallthrough */
import { Column } from "typeorm";

import {
  AccessLevel,
  Authorization,
  CommitteeRole,
  DbRole as DatabaseRole,
} from "../lib/auth.js";

export class Role {
  @Column("enum", { enum: DatabaseRole, default: DatabaseRole.Public })
  dbRole: DatabaseRole = DatabaseRole.Public;

  @Column("enum", { nullable: true, enum: CommitteeRole })
  committeeRole!: CommitteeRole | null;

  @Column("text", { nullable: true })
  committee!: string | null;

  /**
   * Converts a DbRole to an AccessLevel
   *
   * @return The AccessLevel
   * @throws Error if the DbRole is not recognized
   */
  toAccessLevel(): AccessLevel {
    switch (this.dbRole) {
      case DatabaseRole.None: {
        return AccessLevel.None;
      }
      case DatabaseRole.Public: {
        return AccessLevel.Public;
      }
      case DatabaseRole.TeamMember: {
        return AccessLevel.TeamMember;
      }
      case DatabaseRole.TeamCaptain: {
        return AccessLevel.TeamCaptain;
      }
      case DatabaseRole.Committee: {
        if (
          this.committeeRole === CommitteeRole.Coordinator ||
          this.committeeRole === CommitteeRole.Chair
        ) {
          return AccessLevel.CommitteeChairOrCoordinator;
        } else {
          return AccessLevel.Committee;
        }
      }
      default: {
        try {
          throw new Error(`Illegal DbRole: ${JSON.stringify(this.dbRole)}`);
        } catch (error) {
          console.error(error);
          throw new Error(
            `Illegal DbRole: [Parsing of '${String(this.dbRole)}' failed]`
          );
        }
      }
    }
  }

  toAuthorization(): Authorization {
    let accessLevel: AccessLevel = AccessLevel.None;
    switch (this.dbRole) {
      case DatabaseRole.Committee: {
        accessLevel = AccessLevel.Committee;
        break;
      }
      case DatabaseRole.TeamCaptain: {
        accessLevel = AccessLevel.TeamCaptain;
        break;
      }
      case DatabaseRole.TeamMember: {
        accessLevel = AccessLevel.TeamMember;
        break;
      }
      case DatabaseRole.Public: {
        accessLevel = AccessLevel.Public;
        break;
      }
      case DatabaseRole.None: {
        accessLevel = AccessLevel.None;
        break;
      }
      default: {
        accessLevel = AccessLevel.None;
        break;
      }
    }
    if (
      this.committeeRole === CommitteeRole.Chair ||
      this.committee === "tech-committee"
    ) {
      accessLevel = AccessLevel.Admin;
    }

    const auth: Authorization = {
      dbRole: this.dbRole,
      accessLevel,
    };

    if (this.committeeRole && this.committee) {
      auth.committeeRole = this.committeeRole;
      auth.committee = this.committee;
    } else if (this.committee || this.committeeRole) {
      throw new Error(
        "Cannot have a committee role without a committee or vice versa"
      );
    }

    return auth;
  }
}
