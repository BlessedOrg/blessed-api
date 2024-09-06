import { ParsedEvents } from "starknet";
import { formatParsedEventsArray } from "@/utils/contractEvents/formatParsedEventsArray";

export const getTargetEventData = (
  eventName: string,
  parsedEvents: ParsedEvents,
  targetValue: string,
) => {
  const formattedArray = formatParsedEventsArray(parsedEvents);
  const eventObject = formattedArray.find((obj) => obj.eventName === eventName);
  if (!eventObject) return null;
  return eventObject[targetValue];
};