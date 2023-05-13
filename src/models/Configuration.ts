import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import { Attribute, Table } from "@sequelize/core/decorators-legacy";
import {
  CommitteeRole,
  ConfigurationResource,
  DbRole,
} from "@ukdanceblue/db-app-common";

import type { WithToJsonFor } from "../lib/modelTypes.js";

@Table({
  tableName: "",
})
export class ConfigurationModel
  extends Model<
    InferAttributes<ConfigurationModel>,
    InferCreationAttributes<ConfigurationModel>
  >
  implements WithToJsonFor<ConfigurationResource>
{
  toResource(): ConfigurationResource {
    return new ConfigurationResource({
      key: "",
    });
  }
}
