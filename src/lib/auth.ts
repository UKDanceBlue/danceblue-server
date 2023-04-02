import { CommitteeRole, DbRole } from "../entity/Role.js";

export enum AccessLevel {
  None = -1,
  Public = 0,
  TeamMember = 1,
  TeamCaptain = 2,
  Committee = 3,
  CommitteeChairOrCoordinator = 3.5,
  Admin = 4 // Tech committee
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
    accessLevel: AccessLevel.None
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
