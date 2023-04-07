import { Entity } from "typeorm";

import { EntityWithId } from "./EntityWithId.js";

@Entity()
export class Configuration extends EntityWithId {}
