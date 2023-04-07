import createHttpError, { HttpError } from "http-errors";
import { DateTime, Duration, Interval } from "luxon";

import { ErrorApiResponse, errorResponseFrom } from "./JsonResponse.js";

export class LuxonError extends Error {
  cause: Duration | Interval | DateTime;
  explanation: string | null;

  constructor(invalidLuxonObject: Duration | Interval | DateTime) {
    if (invalidLuxonObject.isValid || !invalidLuxonObject.invalidReason) {
      throw new Error("Tried to create an error from a valid Luxon object");
    }
    super(invalidLuxonObject.invalidReason);
    this.name = "LuxonError";

    this.cause = invalidLuxonObject;
    this.explanation = invalidLuxonObject.invalidExplanation;
  }

  toHttpError(
    code: Exclude<keyof typeof createHttpError, "isHttpError"> = "400",
    expose = true
  ): [HttpError, ErrorApiResponse] {
    const httpError = createHttpError[code](this.message);
    httpError.expose = expose;
    httpError.name = this.name;
    httpError.cause = this.cause;
    return [
      httpError,
      errorResponseFrom({
        errorMessage: this.message,
        errorCause: this.cause,
        errorExplanation: this.explanation ?? undefined,
      }),
    ];
  }
}

export class ParsingError extends Error {
  cause: object;

  constructor(message: string, cause: object) {
    super("Error parsing body");
    this.name = "ParsingError";

    this.message = message;
    this.cause = cause;
  }

  toHttpError(
    code: Exclude<keyof typeof createHttpError, "isHttpError"> = "400",
    expose = true
  ): [HttpError, ErrorApiResponse] {
    const httpError = createHttpError[code](this.message);
    httpError.expose = expose;
    httpError.name = this.name;
    httpError.cause = this.cause;
    return [httpError, errorResponseFrom({ errorMessage: this.message })];
  }
}
