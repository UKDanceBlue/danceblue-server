/* eslint-disable no-await-in-loop */
import { faker } from "@faker-js/faker";
import type { CreationAttributes } from "@sequelize/core";
import { DateTime } from "luxon";

import { sequelizeDb } from "../data-source.js";
import { EventModel } from "../models/Event.js";
import { ImageModel } from "../models/Image.js";

const capitalize = (s: string) => s && s[0]!.toUpperCase()! + s.slice(1)!;

/**
 *
 */
export default async function () {
  const events: CreationAttributes<EventModel>[] = [];
  for (let i = 0; i < 10; i++) {
    const occurrences: Date[] = [];
    for (let j = 0; j < faker.datatype.number({ min: 1, max: 3 }); j++) {
      occurrences.push(faker.date.soon(1));
    }
    const adjective = capitalize(faker.word.adjective());
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const aOrAn = ["A", "E", "I", "O", "U"].includes(adjective[0]!)
      ? "an"
      : "a";
    events.push({
      id: undefined,
      title: `${capitalize(
        faker.word.verb()
      )} ${aOrAn} ${adjective} ${capitalize(faker.word.noun())}`,
      duration: DateTime.fromJSDate(faker.date.soon(1)).diffNow(),
      occurrences,
      description: faker.lorem.paragraph(),
      summary: faker.lorem.sentence(),
      location: faker.address.streetAddress(),
    });
  }
  await Promise.all(events.map((event) => EventModel.create(event)));

  // Now add 15 random images to random events
  const fifteenImages = await ImageModel.findAll({
    limit: 15,
    order: sequelizeDb.random(),
  });

  for (const image of fifteenImages) {
    const event = await EventModel.findOne({ order: sequelizeDb.random() });
    if (event) {
      await event.addImage(image);
    }
  }
}
