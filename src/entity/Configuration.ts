import { Entity } from "typeorm";

import { EntityWithId } from "./EntityWithId.js";

@Entity()
export class Configuration {
  // TODO: Come up with a better solution for this
  @PrimaryGeneratedColumn("identity", { generatedIdentity: "ALWAYS" })
  id!: number;
}
