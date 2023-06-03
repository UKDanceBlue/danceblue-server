import { faker } from "@faker-js/faker";
import { DateTime } from "luxon";
import type { CreationAttributes } from "sequelize";

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
    const occurrences: DateTime[] = [];
    for (let j = 0; j < faker.datatype.number({ min: 1, max: 3 }); j++) {
      occurrences.push(DateTime.fromJSDate(faker.date.soon(1)));
    }
    const adjective = capitalize(faker.word.adjective());
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const aOrAn = ["A", "E", "I", "O", "U"].includes(adjective[0]!)
      ? "an"
      : "a";
    // eslint-disable-next-line no-await-in-loop
    events.push({
      id: undefined,
      images: [
        (
          await ImageModel.findOne({
            order: sequelizeDb.random(),
            // eslint-disable-next-line unicorn/no-await-expression-member
          })
        )?.imageId,
      ],
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
}
