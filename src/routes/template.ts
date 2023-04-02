import { join, resolve } from "path";

import dree from "dree";
import express from "express";
const templateRouter = express.Router();

// Map of slugs to getters for page data
const pageDataGetters: { [slug: string]: (req: express.Request, res: express.Response) => Record<string, unknown> } = {
  "/user": (req, res) => ({
    userId: res.locals.userData.userId,
    userData: JSON.stringify(res.locals.userData, null, 2),
  })
};

interface PathInfo {
  slug: string;
  renderPath: string;
  type: "html" | "ejs" | "ejs-body" | "unknown";
}

const paths: PathInfo[] = [];

// Walk baseDir and add all .ejs files to paths, index files are added as /
const baseDir = resolve("views/pages");
dree.scan(baseDir, { extensions: [ "ejs", "html" ] }, (file) => {
  const pathFromBase = file.path.replace(baseDir, "");
  const path = pathFromBase.replace(/\\/g, "/");
  const renderPath = path.replace(/^\//, "").replace(/\.ejs/g, "");
  const slug = path.replace(/index/, "").replace(/\.[A-Za-z\d]+$/, "");
  let type: "html" | "ejs" | "unknown" = "unknown";
  if (file.extension === "html") {
    type = "html";
  } else if (file.extension === "ejs") {
    type = "ejs";
  }
  paths.push({ slug, renderPath, type });
});

const bodyDir = resolve("views/page-bodies");
dree.scan(bodyDir, { extensions: [ "ejs", "html" ] }, (file) => {
  const pathFromBase = file.path.replace(bodyDir, "");
  const path = pathFromBase.replace(/\\/g, "/");
  const renderPath = path.replace(/^\//, "").replace(/\.ejs/g, "");
  const slug = path.replace(/index/, "").replace(/\.[A-Za-z\d]+$/, "");
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
    if (path.type === "html") {
      res.sendFile(resolve("views/pages", path.renderPath));
      return;
    } else if (path.type === "ejs") {
      if (pageDataGetters[path.slug]) {
        res.locals.pageData = {
          ...res.locals.pageData,
          ...(pageDataGetters[path.slug]?.(req, res) ?? {}),
        };
      }
      res.render(path.renderPath, res.locals.pageData);
      return;
    } else if (path.type === "ejs-body") {
      if (pageDataGetters[path.slug]) {
        res.locals.pageData = {
          ...res.locals.pageData,
          ...(pageDataGetters[path.slug]?.(req, res) ?? {})
        };
      }
      res.render(resolve(baseDir, "../framework.ejs"), {
        ...res.locals.pageData,
        pageBodyPath: join(bodyDir, path.renderPath),
      });
      return;
    } else {
      res.status(500);
      console.error(`Unknown file type for ${path.renderPath}`);
      return;
    }
  });
}

export default templateRouter;
