import { ComputeUnitsLineChartProps } from '@/app/(home)/ComputeUnitsLineChart'
import { addDaysToUtc, addHoursToUtc, getDateFromIsoString, getUtcEndOfDay, getUtcStartOfDay } from '@/app/Charts/utils'

type BlockAggregate = {
  __typename: string;
  keys: string[];
  sum: {
    __typename: string;
    totalRelays: string;
    totalComputedUnits: string;
  };
};

export function fillMissingDays(unsortedData: Array<BlockAggregate>, dateTimeZone: 'utc' | 'local'): ComputeUnitsLineChartProps['data'] {
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const today = new Date();

  // Sort the data by date to ensure the correct order
  const data = [...unsortedData].sort((a, b) => new Date(a.keys[0]).getTime() - new Date(b.keys[0]).getTime())

  // Determine the start date (today or the first date in the array)
  const startDate = data.length > 0 ? new Date(data.at(-1).keys[0]) : today;

  // Create a map for existing dates
  const existingData = new Map(
    data.map((item) => [new Date(item.keys[0]).toISOString().split("T")[0], item.sum])
  );

  // Date formatter for the required format
  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", timeZone: dateTimeZone === 'utc' ? 'UTC' : undefined });

  // Generate the last 7 days with data or defaults
  const result: ComputeUnitsLineChartProps['data'] = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate.getTime() - i * oneDayInMs);
    const dateString = currentDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    const formattedDay = dateFormatter.format(currentDate); // Format as "Nov 20"

    if (existingData.has(dateString)) {
      // Use the existing entry if it exists
      const sum = existingData.get(dateString)!;
      result.push({
        day: formattedDay,
        totalRelays: Number(sum.totalRelays),
        totalComputedUnits: Number(sum.totalComputedUnits),
      });
    } else {
      // Add a placeholder for missing days
      result.push({
        day: formattedDay,
        totalRelays: 0,
        totalComputedUnits: 0,
      });
    }
  }

  return result.reverse(); // Return the array in chronological order
}

export function formatTimeDifference(ms: number): string {
  // Convert milliseconds to time components
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  // Build a readable string
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(' ');
}

export function get24hoursBefore(date: Date) {
  return new Date(date.getTime() - 24 * 60 * 60 * 1000)
}

export function getEvolutionVariables(dateStr: string) {
  const currentDate = getDateFromIsoString(dateStr)
  currentDate.setUTCHours(0, 0, 0, 0)
  const yesterdayDate = get24hoursBefore(currentDate)
  const previous2Date = get24hoursBefore(yesterdayDate)
  const previous3Date = get24hoursBefore(previous2Date)
  const previous4Date = get24hoursBefore(previous3Date)
  const previous5Date = get24hoursBefore(previous4Date)
  const previous6Date = get24hoursBefore(previous5Date)

  return {
    currentDate: currentDate.toISOString(),
    yesterdayDate: yesterdayDate.toISOString(),
    previous2Date: previous2Date.toISOString(),
    previous3Date: previous3Date.toISOString(),
    previous4Date: previous4Date.toISOString(),
    previous5Date: previous5Date.toISOString(),
    previous6Date: previous6Date.toISOString(),
    supplyStartDate: getUtcStartOfDay(addDaysToUtc(currentDate, -6)).toISOString(),
    supplyEndDate: getUtcEndOfDay(currentDate).toISOString(),
  }
}

export function getSummaryVariables(dateStr: string) {
  const currentDate = new Date(getDateFromIsoString(dateStr))

  const date24hBefore = addHoursToUtc(currentDate, -24)

  return {
    last24HourDate: date24hBefore.toISOString(),
    currentDate: getUtcEndOfDay(currentDate).toISOString(),
    startCurrentDate: getUtcStartOfDay(currentDate).toISOString(),
    endCurrentDate: getUtcEndOfDay(currentDate).toISOString(),
  }
}

export function getServicesVariables(dateStr: string) {
  const currentDate = getDateFromIsoString(dateStr)

  const last24hDate = addDaysToUtc(currentDate, -1)
  const last48hDate = addDaysToUtc(currentDate, -1)

  return {
    currentDate: currentDate.toISOString(),
    last24hDate: last24hDate.toISOString(),
    last48hDate: last48hDate.toISOString(),
  }
}
