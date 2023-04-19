import { PrimaryGeneratedColumn } from "typeorm";

export abstract class EntityWithId {
  /**
   * This ID should never be exposed to the client
   */
  @PrimaryGeneratedColumn("identity", { generatedIdentity: "ALWAYS" })
  id!: number;
}
