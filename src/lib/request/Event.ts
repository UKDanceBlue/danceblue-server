import type { Interval } from "luxon";

import { WithBodyArray } from "../bodyArray.js";

import { BodyDateTime } from "./common.js";

export interface NewEventBody
  extends WithBodyArray<
    "eventOccurrence",
    {
      start: BodyDateTime;
      end: BodyDateTime;
    }
  > {
  eventName: string;
  eventSummary: string;
  eventDescription: string;
  eventAddress: string;
}

export interface ParsedNewEventBody {
  eventName: string;
  eventSummary: string;
  eventDescription: string;
  eventAddress: string;
  eventIntervals: Interval[];
}
