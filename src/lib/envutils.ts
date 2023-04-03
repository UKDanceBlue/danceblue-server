import { NextFunction } from "express";
import createHttpError from "http-errors";

/**
 * Require an environment variable to be set. If it is not set, call next with an InternalServerError and return false.
 *
 * @param variable The environment variable to check
 * @param name The name of the environment variable
 * @param next The next function to call if the environment variable is not set
 * @return True if the environment variable is set, false otherwise
 */
export function requireEnv<const T extends keyof NodeJS.ProcessEnv>(
  variable: string | undefined,
  name: T,
  next: NextFunction
): [T, string] | null {
  if (!variable) {
    next(
      createHttpError.InternalServerError(
        `Required environment variable not set: ${name}`
      )
    );
    return null;
  } else {
    return [name, variable];
  }
}

/**
 * Require multiple environment variables to be set. If any of them are not set, call next with an InternalServerError and return false.
 *
 * @param variables The environment variables to check
 * @param next The next function to call if any of the environment variables are not set
 * @return True if all of the environment variables are set, false otherwise
 */
export function requireEnvs<
  const T extends Record<keyof NodeJS.ProcessEnv, string | undefined>
>(variables: T, next: NextFunction): Record<keyof T, string> | null {
  // @ts-expect-error This will be valid after the for loop
  const retVal: Record<keyof T, string> = {};
  for (const key in variables) {
    const val = requireEnv(variables[key], key, next);
    if (val === null) {
      return null;
    } else {
      retVal[val[0]] = val[1];
    }
  }
  return retVal;
}
