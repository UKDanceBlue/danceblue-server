import { DateTime } from "luxon";
import { generators } from "openid-client";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

import { luxonDateTimeJsDateTransformer } from "../lib/transformers.js";

@Entity()
export class LoginFlowSession {
  @PrimaryGeneratedColumn("identity", { generatedIdentity: "ALWAYS" })
  id!: number;

  @Column("uuid", { generated: "uuid", unique: true, nullable: false })
  sessionId!: string;

  @Column("text", {
    default: generators.codeVerifier(),
  })
  codeVerifier!: string;

  @CreateDateColumn({
    type: "timestamptz",
    transformer: luxonDateTimeJsDateTransformer,
  })
  creationDate!: DateTime;

  @Column("text", { nullable: true })
  redirectToAfterLogin?: string;
}
