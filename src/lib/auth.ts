import { CommitteeRole, DbRole } from "../entity/Role.js";

export enum AccessLevel {
  Base = -1,
  Public = 0,
  TeamMember = 1,
  TeamCaptain = 2,
  Committee = 3,
  Admin = 4 // Tech committee
}

/**
 * Converts a DbRole to an AccessLevel
 *
 * @param dbRole The DbRole to convert
 * @return The AccessLevel
 * @throws Error if the DbRole is not recognized
 */
export function dbRoleToAccessLevel(dbRole: DbRole): AccessLevel {
  switch (dbRole) {
  case DbRole.None:
    return AccessLevel.Base;
  case DbRole.Public:
    return AccessLevel.Public;
  case DbRole.TeamMember:
    return AccessLevel.TeamMember;
  case DbRole.TeamCaptain:
    return AccessLevel.TeamCaptain;
  case DbRole.Committee:
    return AccessLevel.Committee;
  default:
    if ((dbRole as unknown) == null) {
      throw new Error("Illegal DbRole: dbRole is nullish");
    } else {
      try {
        throw new Error(`Illegal DbRole: ${JSON.stringify(dbRole)}`);
      } catch (e) {
        console.error(e);
        throw new Error(`Illegal DbRole: [Parsing of '${String(dbRole)}' failed]`);
      }
    }
  }
}

export interface Authorization {
  dbRole: DbRole;
  committeeRole?: CommitteeRole;
  committee?: string;
  accessLevel: AccessLevel;
}

/**
 * Returns a default authorization object with no authorization
 *
 * @return A default authorization object
 */
export function defaultAuthorization(): Authorization {
  return {
    dbRole: DbRole.None,
    accessLevel: AccessLevel.Base
  };
}

export interface User {
  auth: Authorization;
  id?: string;
  teamIds?: string[];
  captainOfTeamIds?: string[];
}

/**
 * Returns a default user object with no authorization
 *
 * @return A default user object
 */
export function defaultUser(): User {
  return { auth: defaultAuthorization() };
}
