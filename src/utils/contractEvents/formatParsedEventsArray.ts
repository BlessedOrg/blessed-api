import { parseEventBigNumber } from "@/utils/contractEvents/parseEventBigNumber";

export const formatParsedEventsArray = (parsedEvents: any[]) => {
  return parsedEvents.map((item) => {
    const [[fullKey, eventData]] = Object.entries(item);
    const eventName = fullKey.split("::").pop();

    const formattedEventData = Object.entries(eventData).reduce(
      (acc, [key, value]) => {
        acc[key] =
          typeof value === "bigint" ? parseEventBigNumber(value) : value;
        return acc;
      },
      {},
    );
    return {
      eventName,
      ...formattedEventData,
    };
  });
};