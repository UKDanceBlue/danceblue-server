import { PrimaryGeneratedColumn } from "typeorm";

export interface EntityMethods<T> {
  toString(): string;
  /**
   * This method should be used to convert the entity to a JSON object, generally
   * for sending to the client
   *
   * @return The REST resource representation of the entity
   */
  toJson(): T;
}

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
