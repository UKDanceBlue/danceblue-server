import { Check, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { User } from "./User.js";

@Entity()
export class Client {
  @PrimaryGeneratedColumn("identity", { generatedIdentity: "ALWAYS" })
    id!: number;

  @Column("uuid", { generated: "uuid", unique: true, nullable: false })
    deviceId!: string;

  @Check("client.expo_push_token LIKE 'ExponentPushToken[%]' OR client.expo_push_token LIKE 'ExpoPushToken[%]'")
  @Column("text")
    expoPushToken!: string;

  @ManyToOne(() => User)
    lastUser!: User;
}
