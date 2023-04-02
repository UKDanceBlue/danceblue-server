import { resolve } from "path";

import dree from "dree";
import express from "express";
const templateRouter = express.Router();

interface PathInfo {
  slug: string;
  renderPath: string;
}

const paths: PathInfo[] = [];

// Walk baseDir and add all .ejs files to paths, index files are added as /
const baseDir = resolve("views/pages");
dree.scan(baseDir, { extensions: ["ejs"] }, (file) => {
  const pathFromBase = file.path.replace(baseDir, "");
  const path = pathFromBase.replace(/\\/g, "/").replace(/.ejs/g, "");
  const renderPath = path.replace(/^\//, "");
  const slug = path.replace(/index/, "");
  paths.push({ slug, renderPath });
});

console.log(paths);

for (const path of paths) {
  templateRouter.get(path.slug, (req, res) => {
    res.render(path.renderPath, res.locals.pageData);
  });
}

export default templateRouter;
