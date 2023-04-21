import type { NotificationResource } from "@ukdanceblue/db-app-common";
import { Column, Entity, Index } from "typeorm";

import type { EntityMethods } from "./Base.js";
import { EntityWithId } from "./Base.js";

@Entity()
export class Notification
  extends EntityWithId
  implements NotificationResource, EntityMethods<NotificationResource>
{
  @Index()
  @Column("uuid", { generated: "uuid", unique: true })
  notificationId!: string;

  toJson(): NotificationResource {
    return {
      notificationId: this.notificationId,
    };
  }
}
