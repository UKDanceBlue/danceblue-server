import type { NotificationResource } from "@ukdanceblue/db-app-common";
import { Column, Entity } from "typeorm";

import { EntityWithId } from "./EntityWithId.js";

@Entity()
export class Notification extends EntityWithId implements NotificationResource {
  @Column("uuid", { generated: "uuid", unique: true, nullable: false })
  notificationId!: string;
}
