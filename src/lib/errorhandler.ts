import { ErrorRequestHandler } from "express";
import createHttpError from "http-errors";
import { getReasonPhrase } from "http-status-codes";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    // Allow express to handle the error if headers have already been sent
    return next(err);
  }

  let httpError: createHttpError.HttpError | undefined = undefined;
  if (createHttpError.isHttpError(err)) {
    httpError = err;
  } else if (err instanceof Error) {
    httpError = createHttpError(500, err.message);
  } else {
    httpError = createHttpError(500, "Unknown error");
  }

  if (!httpError.expose && httpError.statusCode >= 500) {
    console.error(err);
  }

  // Configure response
  res.status(httpError.statusCode);
  if (httpError.headers) {
    res.header(httpError.headers);
  }
  const errorReason = getReasonPhrase(httpError.statusCode);

  // Respond with html page
  if (req.accepts("html")) {
    if (httpError.expose) {
      res.send(
        `<html><head><title>${
          httpError.statusCode
        } ${errorReason}</title></head><body><h1>${
          httpError.statusCode
        } ${errorReason}</h1>Message: ${httpError.message}${
          httpError.stack
            ? `<br><code><pre style="border-radius: 10px;background-color: #ededed;padding:1em;">Stack Trace:\n${httpError.stack}</pre></code>`
            : ""
        }</body></html>`
      );
    } else {
      res.send(
        `<html><head><title>${httpError.statusCode} ${errorReason}</title></head><body><h1>${httpError.statusCode} ${errorReason}</h1></body></html>`
      );
    }
    return;
  }

  // Respond with json
  if (req.accepts("json")) {
    const responseObject: {
      error: string;
      code: number;
      stack?: string;
      message?: string;
    } = { error: errorReason, code: httpError.statusCode };

    if (httpError.expose) {
      responseObject.message = httpError.message;
      if (httpError.stack) {
        responseObject.stack = httpError.stack;
      }
    }

    res.send(responseObject);
    return;
  }

  // default to plain-text. send()
  res.type("text").send(`${httpError.statusCode} ${errorReason}`);
  return;

  // if this is not HTTP error and we are not in production, let express handle it the default way
  return next(err);
};
