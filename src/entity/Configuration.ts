import type { ConfigurationResource } from "@ukdanceblue/db-app-common";
import { Column, Entity } from "typeorm";

import type { EntityMethods } from "./Base.js";
import { EntityWithId } from "./Base.js";

@Entity()
export class Configuration
  extends EntityWithId
  implements ConfigurationResource, EntityMethods<ConfigurationResource>
{
  @Column("text")
  key!: string;

  toResource(): ConfigurationResource {
    return {
      key: this.key,
    };
  }
}
