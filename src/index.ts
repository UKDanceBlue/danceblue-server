
import { resolve } from "path";

import express from "express";

import { AppDataSource } from "./data-source.js";
import { Person } from "./entity/Person.js";
import { PointEntry } from "./entity/PointEntry.js";
import templateRouter from "./routes/template.js";

await AppDataSource.initialize();

console.log("Inserting a new user into the database...");
const user = new Person();
user.firstName = "Timber";
user.lastName = "Saw";
user.email = "timber.saw@example.com";
user.linkblue = "abc123";
await AppDataSource.manager.save(user);
console.log(`Saved a new user with id: ${ user.id}`);

const pointEntry = new PointEntry();
pointEntry.personFrom = user;

console.log("Loading users from the database...");
const users = await AppDataSource.manager.find(Person);
console.log("Loaded users: ", users);

const app = express();

app.use(express.static("public"));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", resolve("views/pages"));

app.get("/test", (req, res) => {
  res.send("Hello World!");
});

/*
Default handler for pages in the views/pages directory

If the slug is not already handled by another route, it will be automatically
handled by this route

This route will render the page with only res.locals.pageData
*/
app.use(templateRouter);

const port = parseInt(process.env.API_PORT ?? "", 10);
app.listen(port, () => {
  console.log(`DB Server listening on port ${port}`);
});
