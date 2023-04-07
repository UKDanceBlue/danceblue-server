import { Response } from "express";
import createHttpError, { HttpError } from "http-errors";

import { LuxonError, ParsingError } from "../lib/CustomErrors.js";
import { ErrorApiResponse, errorResponseFrom } from "../lib/JsonResponse.js";

/**
 * Send an error response to the client
 *
 * @param res Express response object
 * @param error HttpError object
 * @param errorContent Optional error content to send
 * @return Express response object
 */
export function sendHttpError(
  res: Response,
  error: HttpError,
  errorContent: ErrorApiResponse = errorResponseFrom({
    errorMessage: error.message,
  })
): Response {
  return res.status(error.status).json(errorContent);
}

/**
 * Send a 400 error response to the client based on a validation error (i.e. ParsingError)
 *
 * @param res Express response object
 * @param error Error object
 * @param errorContent Optional error content to send
 * @return Express response object
 */
export function sendValidationError(
  res: Response,
  error: unknown,
  errorContent?: ErrorApiResponse
): Response {
  if (error instanceof LuxonError || error instanceof ParsingError) {
    const [httpError, responseBody] = error.toHttpError("BadRequest", true);
    return sendHttpError(res, httpError, responseBody);
  } else if (createHttpError.isHttpError(error)) {
    return sendHttpError(res, error, errorContent);
  } else if (error instanceof Error) {
    return sendHttpError(res, createHttpError(error.message), errorContent);
  } else {
    return sendHttpError(res, createHttpError("Unknown error"), errorContent);
  }
}
