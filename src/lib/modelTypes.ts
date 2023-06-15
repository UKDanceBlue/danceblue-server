import { Model } from "@sequelize/core";
import type { CreationOptional } from "@sequelize/core";
import type { RequiredKeys } from "utility-types";

import { logDebug } from "../logger.js";
import type {
  CoreRequired,
  ImportantRequired,
} from "../models/intermediate.js";

export abstract class IntermediateClass<
  R extends object,
  SubClass extends object & IntermediateClass<R, SubClass>
> {
  abstract toResource(): R;

  private readonly corePropertyNames: RequiredKeys<CoreRequired<SubClass>>[];
  private readonly importantPropertyNames: (Exclude<
    RequiredKeys<ImportantRequired<SubClass>>,
    RequiredKeys<CoreRequired<SubClass>>
  > &
    string)[];

  /**
   * Through the magic of TypeScript, this class will check if the
   * required properties are present and provide accurate type
   * guards for the properties.
   *
   * However, this only works if ALL of the properties that are
   * branded as `CoreProperty` or `ImportantProperty` are passed to
   * this constructor. If you miss one, the type guards will
   * silently become inaccurate.
   *
   * Intellisense should show every property that is branded as
   * `CoreProperty` or `ImportantProperty` as a parameter to this
   * constructor, just make sure they are all included.
   *
   * @param corePropertyNames The names of all properties that are branded as `CoreProperty`
   * @param importantPropertyNames The names of all properties that are branded as `ImportantProperty`
   */
  constructor(
    corePropertyNames: RequiredKeys<CoreRequired<SubClass>>[],
    importantPropertyNames: (Exclude<
      RequiredKeys<ImportantRequired<SubClass>>,
      RequiredKeys<CoreRequired<SubClass>>
    > &
      string)[]
  ) {
    this.corePropertyNames = corePropertyNames;
    this.importantPropertyNames = importantPropertyNames;
  }

  public hasCoreProperties(this: SubClass): this is CoreRequired<SubClass> {
    let isOk = true;
    for (const propertyName of this.corePropertyNames) {
      if (
        (this as Record<typeof propertyName, unknown>)[propertyName] ===
        undefined
      ) {
        isOk = false;
        logDebug(
          `Missing core property ${String(propertyName)} on ${
            this.constructor.name
          }`
        );
        break;
      }
    }
    return isOk;
  }

  public hasImportantProperties(
    this: SubClass
  ): this is ImportantRequired<SubClass> {
    let isOk = true;
    for (const propertyName of this.importantPropertyNames) {
      if (
        (this as Record<typeof propertyName, unknown>)[propertyName] ===
        undefined
      ) {
        isOk = false;
        logDebug(
          `Missing important property ${propertyName} on ${this.constructor.name}`
        );
        break;
      }
    }
    return isOk;
  }
}

export class WithTimestamps<
  // eslint-disable-next-line @typescript-eslint/ban-types
  TModelAttributes extends {} = never,
  // eslint-disable-next-line @typescript-eslint/ban-types
  TCreationAttributes extends {} = TModelAttributes
> extends Model<TModelAttributes, TCreationAttributes> {
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;
}
