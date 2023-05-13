import type { ApiResource } from "@ukdanceblue/db-app-common";
import { PrimaryGeneratedColumn } from "typeorm";

export interface EntityMethods<T extends ApiResource> {
  toString(): string;
  /**
   * This method should be used to convert the entity to a JSON object, generally
   * for sending to the client
   *
   * @return The REST resource representation of the entity
   */
  toResource(): T;
}

export abstract class EntityWithId implements EntityMethods<ApiResource> {
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
    return JSON.stringify(this.toResource().serialize());
  }

  /**
   * This method should be used to convert the entity to a resource instance,
   * generally for sending to the client.
   */
  toResource(): ApiResource {
    throw new Error("Not implemented");
  }
}
