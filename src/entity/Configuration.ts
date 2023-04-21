import type { ConfigurationResource } from "@ukdanceblue/db-app-common";
import { Column, Entity } from "typeorm";

import { EntityWithId } from "./EntityWithId.js";

@Entity()
export class Configuration
  extends EntityWithId
  implements ConfigurationResource
{
  @Column("text")
  key!: string;
}
