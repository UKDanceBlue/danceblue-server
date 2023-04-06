import { PrimaryGeneratedColumn } from "typeorm";

export abstract class EntityWithId {
  @PrimaryGeneratedColumn("identity", { generatedIdentity: "ALWAYS" })
  id!: number;
}
