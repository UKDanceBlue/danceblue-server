import type { LoginFlowSessionResource } from "@ukdanceblue/db-app-common";
import { DateTime } from "luxon";
import { generators } from "openid-client";
import { Column, CreateDateColumn, Entity, Index } from "typeorm";

import { luxonDateTimeJsDateTransformer } from "../lib/transformers.js";

import { EntityWithId } from "./EntityWithId.js";

@Entity()
export class LoginFlowSession
  extends EntityWithId
  implements LoginFlowSessionResource
{
  @Index()
  @Column("uuid", { generated: "uuid", unique: true })
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
  redirectToAfterLogin!: string | null;
}
