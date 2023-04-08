import type { Interval } from "luxon";

import { BodyDateTime } from "./htmlDateTime.js";

export interface NewEventBody {
  eventTitle: string;
  eventSummary?: string;
  eventDescription?: string;
  eventAddress?: string;
  eventOccurrences: {
    start: BodyDateTime;
    end: BodyDateTime;
  }[];
  timezone?: string;
}

export interface ParsedNewEventBody {
  eventTitle: string;
  eventSummary?: string;
  eventDescription?: string;
  eventAddress?: string;
  eventIntervals: Interval[];
}
