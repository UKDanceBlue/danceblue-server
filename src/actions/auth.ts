import type { Request, Response } from "express";

/**
 * Log out the user by clearing the token cookie
 *
 * @param req The request to clear the cookie on
 * @param res The response to clear the cookie on
 */
export function logout(req: Request, res: Response) {
  delete (req.cookies as { token: never }).token;
  res.clearCookie("token");
}
