import { ObjectSchema, ValidationOptions, ValidationResult } from "joi";

/**
 * Creates a validator function for a Joi schema. The validator function
 * takes a body and throws an error if the body is invalid.
 *
 * @param schema The Joi schema to validate the body against
 * @param options The Joi validation options
 * @return A validator function
 */
export function makeValidator<const T>(
  schema: ObjectSchema<T>,
  options?: ValidationOptions
): (body: unknown) => ValidationResult<T> {
  return (body: unknown): ValidationResult<T> => {
    const result = schema.validate(body, options);

    if (result.error) {
      throw result.error;
    }

    return result;
  };
}
