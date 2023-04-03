import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Configuration {
  // TODO: Come up with a better solution for this
  @PrimaryGeneratedColumn("identity", { generatedIdentity: "ALWAYS" })
  id!: number;
}
