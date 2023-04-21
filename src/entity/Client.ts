import type { ClientResource } from "@ukdanceblue/db-app-common";
import { Check, Column, Entity, ManyToOne } from "typeorm";

import { EntityWithId } from "./EntityWithId.js";
import { Person } from "./Person.js";

@Entity()
export class Client extends EntityWithId implements ClientResource {
  @Column("uuid", { generated: "uuid", unique: true, nullable: false })
  deviceId!: string;

  @Check(
    "client.expo_push_token LIKE 'ExponentPushToken[%]' OR client.expo_push_token LIKE 'ExpoPushToken[%]'"
  )
  @Column("text")
  expoPushToken!: string;

  @ManyToOne(() => Person)
  lastUser!: Person;
}
