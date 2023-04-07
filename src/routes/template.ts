import { join, resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";

import dree from "dree";
import express from "express";
import createHttpError from "http-errors";

import {
  AccessLevel,
  Authorization,
  isMinAuthSatisfied,
  simpleAuthorizations,
} from "../lib/auth.js";
const templateRouter = express.Router();

// Map of slugs to getters for page data
const pageDataGetters: Record<
  string,
  (req: express.Request, res: express.Response) => Record<string, unknown>
> = {
  "/user": (req, res) => ({
    userId: res.locals.userData.userId,
    userData: JSON.stringify(res.locals.userData, null, 2),
  }),
};

const pageTitles: Record<string, string | undefined> = {
  "/user": "User",
  "/form-test": "Form Test",
  "/new-event": "New Event",
};

/**
 * A page must be in this object to appear in the navbar
 */
const pagesByAuth: Partial<
  Record<string, { minAuth?: Authorization; exactAuth?: Authorization } | null>
> = {
  "/user": { minAuth: simpleAuthorizations[AccessLevel.Public] },
  "/form-test": null,
  "/new-event": {
    minAuth: simpleAuthorizations[AccessLevel.CommitteeChairOrCoordinator],
  },
};

templateRouter.use((req, res, next) => {
  res.locals.shownPages = [];
  for (const [slug, pageAuthRequirements] of Object.entries(pagesByAuth)) {
    if (!pageAuthRequirements) {
      res.locals.shownPages.push({
        slug,
        title: pageTitles[slug] ?? slug.replace(/^\/?(.*(\/.*\/)+)?\/?/, ""),
      });
      continue;
    }
    if (
      pageAuthRequirements.exactAuth &&
      !isDeepStrictEqual(
        pageAuthRequirements.exactAuth,
        res.locals.userData.auth
      )
    ) {
      if (slug === req.path) {
        const forbiddenError = new createHttpError.Forbidden();
        forbiddenError.expose = false;
        return next(forbiddenError);
      }
      continue;
    }
    if (
      pageAuthRequirements.minAuth &&
      !isMinAuthSatisfied(
        pageAuthRequirements.minAuth,
        res.locals.userData.auth
      )
    ) {
      if (slug === req.path) {
        const forbiddenError = new createHttpError.Forbidden();
        forbiddenError.expose = false;
        return next(forbiddenError);
      }
      continue;
    }
    res.locals.shownPages.push({
      slug,
      title: pageTitles[slug] ?? slug.replace(/^(.*(\/.*\/)+)/, ""),
    });
  }

  next();
});

interface PathInfo {
  slug: string;
  renderPath: string;
  type: "html" | "ejs" | "ejs-body" | "unknown";
}

const paths: PathInfo[] = [];

// Walk baseDir and add all .ejs files to paths, index files are added as /
const baseDir = resolve("views/pages");
dree.scan(baseDir, { extensions: ["ejs", "html"] }, (file) => {
  const pathFromBase = file.path.replace(baseDir, "");
  const path = pathFromBase.replaceAll('\\', "/");
  const renderPath = path.replace(/^\//, "").replaceAll('.ejs', "");
  const slug = path.replace(/index/, "").replace(/\.[\dA-Za-z]+$/, "");
  let type: "html" | "ejs" | "unknown" = "unknown";
  if (file.extension === "html") {
    type = "html";
  } else if (file.extension === "ejs") {
    type = "ejs";
  }
  paths.push({ slug, renderPath, type });
});

const bodyDir = resolve("views/page-bodies");
dree.scan(bodyDir, { extensions: ["ejs", "html"] }, (file) => {
  const pathFromBase = file.path.replace(bodyDir, "");
  const path = pathFromBase.replaceAll('\\', "/");
  const renderPath = path.replace(/^\//, "").replaceAll('.ejs', "");
  const slug = path.replace(/index/, "").replace(/\.[\dA-Za-z]+$/, "");
  if (file.extension !== "ejs") {
    return;
  }
  paths.push({ slug, renderPath, type: "ejs-body" });
});

// Check for conflicting paths (same slug)
const pathSlugs = paths.map((path) => path.slug);
const pathSlugsSet = new Set(pathSlugs);
if (pathSlugs.length !== pathSlugsSet.size) {
  console.error("Conflicting paths detected!");
  console.error("Paths:");
  console.table(paths);
  process.exit(1);
}

for (const path of paths) {
  templateRouter.get(path.slug, (req, res) => {
    let pageData: Record<string, unknown> = {
      shownPages: res.locals.shownPages,
      activePage: path.slug,
      title: pageTitles[path.slug] ?? "DanceBlue Admin",
      isLoggedIn: res.locals.userData.userId != null,
    };

    if (path.type === "html") {
      res.sendFile(resolve("views/pages", path.renderPath));
      return;
    } else if (path.type.startsWith("ejs")) {
      // Setup page data
      if (pageDataGetters[path.slug]) {
        pageData = {
          ...pageData,
          ...(pageDataGetters[path.slug]?.(req, res) ?? {}),
        };
      }

      // Render page
      if (path.type === "ejs") {
        res.render(path.renderPath, pageData);
      } else if (path.type === "ejs-body") {
        res.render(resolve(baseDir, "../framework.ejs"), {
          ...pageData,
          pageBodyPath: join(bodyDir, path.renderPath),
        });
      }
      return;
    } else {
      res.status(500);
      console.error(`Unknown file type for ${path.renderPath}`);
      return;
    }
  });
}

export default templateRouter;
