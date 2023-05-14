import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "@sequelize/core";
import { DataTypes, Model } from "@sequelize/core";
import { Attribute, Table } from "@sequelize/core/decorators-legacy";
import type {} from "@ukdanceblue/db-app-common";
import { CommitteeRole, DbRole } from "@ukdanceblue/db-app-common";

import type { ModelFor } from "../lib/modelTypes.js";

// @Table({
//   tableName: "",
// })
// export class ModelName
//   extends Model<InferAttributes<ModelName>, InferCreationAttributes<ModelName>>
//   implements WithToJsonFor<ResourceName> {}