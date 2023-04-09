export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface SortingOptions {
  sortBy: string;
  sortDirection?: "asc" | "desc";
}
