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

/**
 * Reload the session asynchronously (rather than using the callback)
 *
 * @param req Express request
 */
export function reloadSessionAsync(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.reload((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Destroy the session asynchronously (rather than using the callback)
 *
 * @param req Express request
 */
export function destroySessionAsync(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
