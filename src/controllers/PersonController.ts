import type {
  AuthSource,
  OptionalNullOrUndefined,
  PersonResource,
} from "@ukdanceblue/db-app-common";

import { PersonModel } from "../models/Person.js";

/**
 * Searches the database for a user with the given auth IDs or user data, or creates a new user if none is found
 *
 * @param personRepository The repository to use to search for the user
 * @param authIds The auth IDs to search for
 * @param userData The user data to fall back on if no user is found with the given auth IDs
 */
export async function findPersonForLogin(
  authIds: Partial<Record<AuthSource, string>>,
  userData: OptionalNullOrUndefined<PersonResource>
): Promise<[PersonModel, boolean]> {
  let currentPerson = await PersonModel.findOne({ where: { authIds } });
  let created = false;
  if (!currentPerson && userData.linkblue) {
    currentPerson = await PersonModel.findOne({
      where: { linkblue: userData.linkblue },
    });
  }
  if (!currentPerson && userData.email) {
    currentPerson = await PersonModel.findOne({
      where: { email: userData.email },
    });
  }
  if (!currentPerson) {
    if (!userData.email) {
      throw new Error("No email provided for new user");
    }
    currentPerson = PersonModel.build({
      authIds,
      email: userData.email,
    });

    const {
      firstName,
      lastName,
      linkblue,
      role,
      memberOf,
      captainOf,
      pointEntries,
    } = userData;

    if (firstName) currentPerson.firstName = firstName;
    if (lastName) currentPerson.lastName = lastName;
    if (linkblue) currentPerson.linkblue = linkblue;
    if (role) {
      currentPerson.dbRole = role.dbRole;
      currentPerson.committeeRole = role.committeeRole;
      currentPerson.committeeName = role.committee;
    }
    // if (memberOf) currentPerson.memberOf = memberOf;
    // if (captainOf) currentPerson.captainOf = captainOf;
    // if (pointEntries) currentPerson.pointEntries = pointEntries;

    created = true;
  }
  return [currentPerson, created];
}
