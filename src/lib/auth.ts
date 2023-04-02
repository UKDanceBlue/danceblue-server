import { NextFunction, Request } from "express";
import createHttpError from "http-errors";
import jsonwebtoken from "jsonwebtoken";
import { Repository } from "typeorm";

import { Person } from "../entity/Person.js";
import { CommitteeRole, DbRole } from "../entity/Role.js";

export enum AuthSource {
  UkyLinkblue = "uky-linkblue"
}

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

export interface UserData {
  auth: Authorization;
  userId?: string;
  teamIds?: string[];
  captainOfTeamIds?: string[];
}

/**
 * Returns a default user object with no authorization
 *
 * @return A default user object
 */
export function defaultUserData(): UserData {
  return { auth: defaultAuthorization() };
}

type OptionalNullOrUndefined<T> = Partial<{ [K in keyof T]: NonNullable<T[K]> | null | undefined }>;
/**
 * Searches the database for a user with the given auth IDs or user data, or creates a new user if none is found
 *
 * @param personRepository The repository to use to search for the user
 * @param authIds The auth IDs to search for
 * @param userData The user data to fall back on if no user is found with the given auth IDs
 */
export async function findPersonForLogin(personRepository: Repository<Person>, authIds: Partial<Record<AuthSource, string>>, userData: OptionalNullOrUndefined<Person>): Promise<[Person, boolean]> {
  let currentPerson = await personRepository.findOne({ where: { authIds } });
  let created = false;
  if (!currentPerson && userData.linkblue) {
    currentPerson = await personRepository.findOne({ where: { linkblue: userData.linkblue } });
  }
  if (!currentPerson && userData.email) {
    currentPerson = await personRepository.findOne({ where: { email: userData.email } });
  }
  if (!currentPerson) {
    currentPerson = new Person();
    created = true;
  }
  return [ currentPerson, created ];
}

const jwtIssuer = "https://app.danceblue.org";

export interface JwtPayload {
  sub: string;
  dbRole: DbRole;
  committeeRole?: CommitteeRole;
  committee?: string;
  accessLevel: AccessLevel;
  teamIds?: string[];
  captainOfTeamIds?: string[];
}

/**
 * @param payload The payload to check
 * @return Whether the payload is a valid JWT payload
 */
export function isValidJwtPayload(payload: unknown): payload is JwtPayload {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }
  const {
    sub, dbRole, committeeRole, committee, accessLevel, teamIds, captainOfTeamIds
  } = payload as Record<keyof JwtPayload, unknown>;
  if (typeof sub !== "string") {
    return false;
  }
  if (typeof dbRole !== "string" || !Object.values(DbRole).includes(dbRole as DbRole)) {
    return false;
  }
  if (committeeRole !== undefined && (typeof committeeRole !== "string" || !Object.values(CommitteeRole).includes(committeeRole as CommitteeRole))) {
    return false;
  }
  if (committee !== undefined && typeof committee !== "string") {
    return false;
  }
  if (typeof accessLevel !== "number" || !Object.values(AccessLevel).includes(accessLevel as AccessLevel)) {
    return false;
  }
  if (teamIds !== undefined && !Array.isArray(teamIds)) {
    return false;
  }
  if (captainOfTeamIds !== undefined && !Array.isArray(captainOfTeamIds)) {
    return false;
  }
  return true;
}

/**
 * Mints a JWT for the given user data
 *
 * @param user The user data to mint a JWT for
 * @return The JWT, containing the user's authorization data
 */
export function makeUserJwt(user: UserData): string {
  if (!user.userId) {
    throw new Error("Cannot make a JWT for a user with no ID");
  }

  const payload: JwtPayload = {
    sub: user.userId,
    dbRole: user.auth.dbRole,
    accessLevel: user.auth.accessLevel
  };

  if (user.auth.committeeRole) {
    payload.committeeRole = user.auth.committeeRole;
  }
  if (user.auth.committee) {
    payload.committee = user.auth.committee;
  }
  if (user.teamIds) {
    payload.teamIds = user.teamIds;
  }
  if (user.captainOfTeamIds) {
    payload.captainOfTeamIds = user.captainOfTeamIds;
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

  const payload = jsonwebtoken.verify(token, process.env.JWT_SECRET, { issuer: jwtIssuer });

  if (!isValidJwtPayload(payload)) {
    throw new Error("Invalid JWT payload");
  }

  const userData: UserData = {
    auth: {
      accessLevel: payload.accessLevel,
      dbRole: payload.dbRole,
    },
    userId: payload.sub
  };

  if (payload.committeeRole) {
    userData.auth.committeeRole = payload.committeeRole;
  }
  if (payload.committee) {
    userData.auth.committee = payload.committee;
  }
  if (payload.teamIds) {
    userData.teamIds = payload.teamIds;
  }
  if (payload.captainOfTeamIds) {
    userData.captainOfTeamIds = payload.captainOfTeamIds;
  }

  return userData;
}

/**
 * Parses a JWT from a request
 *
 * @param req The request to parse the JWT from
 * @return The JWT, or undefined if no JWT was found and any error messages
 */
export function tokenFromRequest(req: Request): [string | undefined, "invalid-header" | "not-bearer" | null] {
  // Prefer cookie
  let jsonWebToken: string | undefined = undefined;
  const cookies = req.cookies as unknown;
  if ( typeof cookies === "object" && cookies && typeof (cookies as { token: unknown }).token === "string") {
    jsonWebToken = (cookies as { token: string }).token;
  }

  // Fallback to header
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const headerParts = authHeader.split(" ");
    if (headerParts.length !== 2) {
      return [ undefined, "invalid-header" ];
    }
    const authType = headerParts[0];
    jsonWebToken = headerParts[1];
  
    if (authType !== "Bearer") {
      return [ undefined, "not-bearer" ];
    }
  }

  return [ jsonWebToken, null ];
}
