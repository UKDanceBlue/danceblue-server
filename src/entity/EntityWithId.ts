import { PrimaryGeneratedColumn } from "typeorm";

export abstract class EntityWithId {
  /**
   * This ID should never be exposed to the client
   */
  @PrimaryGeneratedColumn("identity", { generatedIdentity: "ALWAYS" })
  id!: number;

  /**
   * DEBUG METHOD
   *
   * @return A string representation of the entity
   */
  toString(): string {
    return JSON.stringify(this);
  }
}
