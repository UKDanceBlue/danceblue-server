import { Column, Entity } from "typeorm";

import { EntityWithId } from "./EntityWithId.js";

@Entity()
export class Notification extends EntityWithId {
  @Column("uuid", { generated: "uuid", unique: true, nullable: false })
  notificationId!: string;
}
