import { resolve } from "path";

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
  type: "html" | "ejs" | "unknown";
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
    } else {
      res.status(500);
      console.error(`Unknown file type for ${path.renderPath}`);
      return;
    }
  });
}

export default templateRouter;
