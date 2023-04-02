import { Request } from "express";

/**
 * Save the session asynchronously (rather than using the callback)
 *
 * @param req Express request
 */
export function saveSessionAsync(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
