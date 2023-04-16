import type { PaginationOptions, SortingOptions } from "@ukdanceblue/db-app-common";
import Joi from "joi";

export const paginationOptionsSchema: Joi.StrictSchemaMap<PaginationOptions> = {
  page: Joi.number().integer().min(1).optional().default(1),
  pageSize: Joi.number().integer().min(1).optional().default(10),
};

export const sortingOptionsSchema: Joi.StrictSchemaMap<SortingOptions> = {
  sortBy: Joi.string().optional().not("id"),
  sortDirection: Joi.string().valid("asc", "desc").optional().default("asc"),
};
