import type {
  Authorization,
  JwtPayload,
  UserData,
} from "@ukdanceblue/db-app-common";
import {
  AccessLevel,
  AuthSource,
  CommitteeRole,
  DbRole,
} from "@ukdanceblue/db-app-common";
import type { Request } from "express";
import jsonwebtoken from "jsonwebtoken";

/**
 * Compares an authorization object to a minimum authorization object
 * and returns true if the authorization object satisfies the minimum
 * authorization object (i.e. the authorization object has at least
 * the same authorization as the minimum authorization object)
 *
 * @param minAuth The minimum authorization object
 * @param auth The authorization object to compare to the minimum authorization object
 * @return True if the authorization object satisfies the minimum authorization object
 *        and false otherwise
 */
export function isMinAuthSatisfied(
  minAuth: Authorization,
  auth: Authorization
): boolean {
  if (auth.accessLevel < minAuth.accessLevel) {
    return false;
  }
  if (minAuth.committeeRole && auth.committeeRole !== minAuth.committeeRole) {
    return false;
  }
  if (minAuth.committee && auth.committee !== minAuth.committee) {
    return false;
  }
  return true;
}

/**
 * Returns a default authorization object with no authorization
 *
 * @return A default authorization object
 */
export const defaultAuthorization = {
  dbRole: DbRole.None,
  accessLevel: AccessLevel.None,
} satisfies Authorization;

export const simpleAuthorizations: Record<AccessLevel, Authorization> = {
  [AccessLevel.None]: defaultAuthorization,
  [AccessLevel.Public]: {
    dbRole: DbRole.Public,
    accessLevel: AccessLevel.Public,
  },
  [AccessLevel.TeamMember]: {
    dbRole: DbRole.TeamMember,
    accessLevel: AccessLevel.TeamMember,
  },
  [AccessLevel.TeamCaptain]: {
    dbRole: DbRole.TeamCaptain,
    accessLevel: AccessLevel.TeamCaptain,
  },
  [AccessLevel.Committee]: {
    dbRole: DbRole.Committee,
    accessLevel: AccessLevel.Committee,
  },
  [AccessLevel.CommitteeChairOrCoordinator]: {
    dbRole: DbRole.Committee,
    accessLevel: AccessLevel.CommitteeChairOrCoordinator,
  },
  [AccessLevel.Admin]: {
    dbRole: DbRole.Committee,
    accessLevel: AccessLevel.Admin,
  },
};

/**
 * Returns a default user object with no authorization
 *
 * @return A default user object
 */
export const defaultUserData = { auth: defaultAuthorization };

const jwtIssuer = "https://app.danceblue.org";

/**
 * @param payload The payload to check
 * @return Whether the payload is a valid JWT payload
 */
export function isValidJwtPayload(payload: unknown): payload is JwtPayload {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }
  const {
    sub,
    auth_source,
    dbRole,
    committee_role,
    committee,
    access_level,
    team_ids,
    captain_of_team_ids,
  } = payload as Record<keyof JwtPayload, unknown>;
  if (typeof sub !== "string") {
    return false;
  }
  if (!Object.values(AuthSource).includes(auth_source as AuthSource)) {
    return false;
  }
  if (
    typeof dbRole !== "string" ||
    !Object.values(DbRole).includes(dbRole as DbRole)
  ) {
    return false;
  }
  if (
    committee_role !== undefined &&
    (typeof committee_role !== "string" ||
      !Object.values(CommitteeRole).includes(committee_role as CommitteeRole))
  ) {
    return false;
  }
  if (committee !== undefined && typeof committee !== "string") {
    return false;
  }
  if (
    typeof access_level !== "number" ||
    !Object.values(AccessLevel).includes(access_level as AccessLevel)
  ) {
    return false;
  }
  if (team_ids !== undefined && !Array.isArray(team_ids)) {
    return false;
  }
  if (
    captain_of_team_ids !== undefined &&
    !Array.isArray(captain_of_team_ids)
  ) {
    return false;
  }
  return true;
}

/**
 * Mints a JWT for the given user data
 *
 * @param user The user data to mint a JWT for
 * @param source The source of the user's authorization
 * @return The JWT, containing the user's authorization data
 */
export function makeUserJwt(user: UserData, source: AuthSource): string {
  if (!user.userId) {
    throw new Error("Cannot make a JWT for a user with no ID");
  }

  const payload: JwtPayload = {
    sub: user.userId,
    auth_source: source,
    dbRole: user.auth.dbRole,
    access_level: user.auth.accessLevel,
  };

  if (user.auth.committeeRole) {
    payload.committee_role = user.auth.committeeRole;
  }
  if (user.auth.committee) {
    payload.committee = user.auth.committee;
  }
  if (user.teamIds) {
    payload.team_ids = user.teamIds;
  }
  if (user.captainOfTeamIds) {
    payload.captain_of_team_ids = user.captainOfTeamIds;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }

  return jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
    issuer: jwtIssuer,
    expiresIn: "1d",
  });
}

/**
 * Parses a JWT into user data
 *
 * @param token The JWT to parse
 * @return The user data contained in the JWT
 */
export function parseUserJwt(token: string): UserData {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }

  const payload = jsonwebtoken.verify(token, process.env.JWT_SECRET, {
    issuer: jwtIssuer,
  });

  if (!isValidJwtPayload(payload)) {
    throw new Error("Invalid JWT payload");
  }

  if (
    payload.auth_source === AuthSource.Anonymous &&
    payload.access_level > AccessLevel.Public
  ) {
    throw new jsonwebtoken.JsonWebTokenError(
      "Anonymous users cannot have access levels greater than public"
    );
  }

  const userData: UserData = {
    auth: {
      accessLevel: payload.access_level,
      dbRole: payload.dbRole,
    },
    userId: payload.sub,
  };

  if (payload.committee_role) {
    userData.auth.committeeRole = payload.committee_role;
  }
  if (payload.committee) {
    userData.auth.committee = payload.committee;
  }
  if (payload.team_ids) {
    userData.teamIds = payload.team_ids;
  }
  if (payload.captain_of_team_ids) {
    userData.captainOfTeamIds = payload.captain_of_team_ids;
  }

  return userData;
}

/**
 * Parses a JWT from a request
 *
 * @param req The request to parse the JWT from
 * @return The JWT, or undefined if no JWT was found and any error messages
 */
export function tokenFromRequest(
  req: Request
): [string | undefined, "invalid-header" | "not-bearer" | null] {
  // Prefer cookie
  let jsonWebToken: string | undefined = undefined;
  const cookies = req.cookies as unknown;
  if (
    typeof cookies === "object" &&
    cookies &&
    typeof (cookies as { token: unknown }).token === "string"
  ) {
    jsonWebToken = (cookies as { token: string }).token;
  }

  // Fallback to header
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const headerParts = authHeader.split(" ");
    if (headerParts.length !== 2) {
      return [undefined, "invalid-header"];
    }
    const authType = headerParts[0];
    jsonWebToken = headerParts[1];

    if (authType !== "Bearer") {
      return [undefined, "not-bearer"];
    }
  }

  return [jsonWebToken, null];
}
