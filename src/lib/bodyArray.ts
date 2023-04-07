export type BodyArrayKey<T extends string> = `${T}[${number}]`;

export type WithBodyArray<T extends string, U> = Record<BodyArrayKey<T>, U>;

/**
 *
 * @param keyText The key's base text (i.e. "value" for "value[0]")
 * @param body The body to check
 * @param callback The callback to call for each value
 */
export function doForEachBodyArrayKey<
  const KeyType extends string,
  const ValueType,
  const BodyType extends WithBodyArray<KeyType, ValueType>
>(
  keyText: KeyType,
  body: BodyType,
  callback: (value: ValueType) => void
): void {
  for (const key of Object.keys(body)) {
    if (!key.startsWith("eventOccurrence[")) {
      continue;
    }

    const eventOccurrenceIndex = parseInt(key.slice(16, -1), 10);

    const eventOccurrence = body[`${keyText}[${eventOccurrenceIndex}]`];
    if (!eventOccurrence) {
      throw new Error("Invalid key for event occurrence");
    }

    callback(eventOccurrence);
  }
}

/**
 * Converts a body array to an array.
 *
 * @param keyText The key's base text (i.e. "value" for "value[0]")
 * @param body The body to convert
 * @param conversionFunction The function to convert each value
 * @return The converted array
 */
export function bodyArrayToArray<
  const KeyType extends string,
  const ValueType,
  const BodyType extends WithBodyArray<KeyType, ValueType>,
  const ReturnType
>(
  keyText: KeyType,
  body: BodyType,
  conversionFunction: (value: ValueType) => ReturnType
): ReturnType[] {
  const result: ReturnType[] = [];

  doForEachBodyArrayKey<KeyType, ValueType, BodyType>(
    keyText,
    body,
    (value) => {
      result.push(conversionFunction(value));
    }
  );

  return result;
}
