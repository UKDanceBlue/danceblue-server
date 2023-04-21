import type { NotificationResource } from "@ukdanceblue/db-app-common";
import { Column, Entity, Index } from "typeorm";

import { EntityWithId } from "./EntityWithId.js";

@Entity()
export class Notification extends EntityWithId implements NotificationResource {
  @Index()
  @Column("uuid", { generated: "uuid", unique: true })
  notificationId!: string;
}
