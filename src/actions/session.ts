import { Request } from "express";

/**
 * Save the session asynchronously (rather than using the callback)
 *
 * @param req Express request
 */
export function saveSessionAsync(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);
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
    req.session.reload((error) => {
      if (error) {
        reject(error);
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
    req.session.destroy((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
