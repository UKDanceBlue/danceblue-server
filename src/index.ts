import { AppDataSource } from "./data-source.js";
import { Person } from "./entity/Person.js";
import { PointEntry } from "./entity/PointEntry.js";

AppDataSource.initialize().then(async () => {
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

  console.log("Here you can setup and run express / fastify / any other framework.");
}).catch((error) => console.log(error));
