/* eslint-disable class-methods-use-this */
// Credits to @recurrence
// https://gist.github.com/recurrence/b6a4cb04a8ddf42eda4e4be520921bd2

import { DefaultNamingStrategy, NamingStrategyInterface } from "typeorm";
import { snakeCase as snakeCaseImport } from "typeorm/util/StringUtils.js";

const snakeCase = (str: string): string =>
  (snakeCaseImport as (param: string) => string)(str);

export class CustomNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName: string): string {
    return customName ? customName : snakeCase(className);
  }

  columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[]
  ): string {
    return (
      snakeCase(embeddedPrefixes.concat("").join("_")) +
      (customName ? customName : snakeCase(propertyName))
    );
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return snakeCase(`${relationName}_${referencedColumnName}`);
  }

  joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string
    // secondPropertyName: string
  ): string {
    return snakeCase(
      `${firstTableName}_${firstPropertyName.replace(
        /\./gi,
        "_"
      )}_${secondTableName}`
    );
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string
  ): string {
    return snakeCase(`${tableName}_${columnName ? columnName : propertyName}`);
  }

  classTableInheritanceParentColumnName(
    parentTableName: string,
    parentTableIdPropertyName: string
  ): string {
    return snakeCase(`${parentTableName}_${parentTableIdPropertyName}`);
  }

  eagerJoinRelationAlias(alias: string, propertyPath: string): string {
    return `${alias}__${propertyPath.replace(".", "_")}`;
  }
}
