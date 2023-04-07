# Request types

These type definitions describe valid bodies, url parameters, and query
parameters for various routes. The files should consist of something like:

NOTE: _All dates and times are ISO 8601 strings._

```typescript
export interface SomeRouteBody {
  aTextValue: string;
  startDateTime: string; // Date and time
  endTime: string; // Time only
  birthDate: string; // Date only
  aComplexOptionalValue?: string;
  count: number;
  // Neither of these are in the parsed body:
  isOk?: boolean;
  problem?: string;
}

// If necessary:
export interface ParsedSomeRouteBody {
  aTextValue: string;
  startDateTime: DateTime;
  endTime: DateTime;
  birthDate: Date;
  aComplexOptionalValue: {
    [key: string]: string;
  };
  count: number;
}

export interface SomeRouteParams {
  id: string;
}

export interface SomeRouteQuery {
  page: number;
  pageSize: number;
}
```

Remember to update the relevant validator when modifying these files.
