import type { ClientResource } from "@ukdanceblue/db-app-common";
import { Check, Column, Entity, Index, ManyToOne } from "typeorm";

import type { EntityMethods } from "./Base.js";
import { EntityWithId } from "./Base.js";
import { Person } from "./Person.js";

/** @deprecated */
@Entity()
export class Client
  extends EntityWithId
  implements ClientResource, EntityMethods<ClientResource>
{
  @Index()
  @Column("uuid", { generated: "uuid", unique: true })
  deviceId!: string;

  @Check(
    "client.expo_push_token LIKE 'ExponentPushToken[%]' OR client.expo_push_token LIKE 'ExpoPushToken[%]'"
  )
  @Column("text")
  expoPushToken!: string;

  @ManyToOne(() => Person)
  lastUser!: Person;

  toJson(): ClientResource {
    return {
      deviceId: this.deviceId,
      expoPushToken: this.expoPushToken,
      lastUser: this.lastUser.toJson(),
    };
  }
}
