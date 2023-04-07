import { appDataSource } from "../data-source.js";
import { Event } from "../entity/Event.js";

export const EventRepository = appDataSource.getRepository(Event).extend({
  findByEventId(eventId: string) {
    return this.findOneBy({ eventId });
  },
});
