export enum ClientAction {
  LOGOUT = "logout",
}

export interface BaseResponse {
  ok: boolean;
  clientAction?: ClientAction[];
}

export interface OkApiResponse<DataType> extends BaseResponse {
  ok: true;
  data?: DataType;
}

/**
 * Creates an OK API response with the given data.
 *
 * @param opts The options
 * @param opts.value The response data
 * @return The OK API response
 */
export function okResponseFrom<DataType>({
  value = undefined,
}: {
  value?: DataType;
} = {}): OkApiResponse<DataType> {
  const response: OkApiResponse<DataType> = {
    ok: true,
  };
  if (value !== undefined) {
    response.data = value;
  }
  return response;
}

export interface CreatedApiResponse<DataType> extends OkApiResponse<DataType> {
  id: string;
}

/**
 * Creates a created API response with the given data.
 * The response will have an `id` property.
 *
 * @param opts The options
 * @param opts.value The response data
 * @param opts.id The ID of the created resource
 * @return The created API response
 */
export function createdResponseFrom<DataType>({
  value,
  id,
}: {
  value?: DataType;
  id: string;
}): CreatedApiResponse<DataType> {
  const okResponse: OkApiResponse<DataType> =
    value !== undefined ? okResponseFrom({ value }) : okResponseFrom();
  return {
    ...okResponse,
    id,
  };
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedApiResponse<DataType>
  extends OkApiResponse<DataType> {
  pagination: PaginationInfo;
}

export interface ErrorApiResponse extends BaseResponse {
  ok: false;
  errorMessage: string;
  errorDetails?: string;
  errorExplanation?: string;
  errorCause?: unknown;
}

/**
 * Creates an error API response with the given error message.
 *
 * @param root0 The options
 * @param root0.errorMessage The error message
 * @param root0.errorDetails The error details
 * @param root0.errorCause The error cause
 * @param root0.errorExplanation The error explanation
 * @return The error API response
 */
export function errorResponseFrom({
  errorMessage,
  errorDetails = undefined,
  errorExplanation = undefined,
  errorCause = undefined,
}: {
  errorMessage: string;
  errorDetails?: string | undefined;
  errorExplanation?: string | undefined;
  errorCause?: unknown | undefined;
}): ErrorApiResponse {
  const response: ErrorApiResponse = {
    errorMessage,
    ok: false,
  };

  if (errorDetails !== undefined) {
    response.errorDetails = errorDetails;
  }
  if (errorExplanation !== undefined) {
    response.errorExplanation = errorExplanation;
  }
  if (errorCause !== undefined) {
    response.errorCause = errorCause;
  }

  return response;
}

export type ApiResponse<DataType> =
  | OkApiResponse<DataType>
  | PaginatedApiResponse<DataType>
  | ErrorApiResponse;
