import { ComputeUnitsLineChartProps } from '@/app/(home)/ComputeUnitsLineChart'

type BlockAggregate = {
  __typename: string;
  keys: string[];
  sum: {
    __typename: string;
    totalRelays: string;
    totalComputedUnits: string;
  };
};

export function fillMissingDays(data: Array<BlockAggregate>): ComputeUnitsLineChartProps['data'] {
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const today = new Date();

  // Determine the start date (today or the first date in the array)
  const startDate = data.length > 0 ? new Date(data[0].keys[0]) : today;

  // Create a map for existing dates
  const existingData = new Map(
    data.map((item) => [new Date(item.keys[0]).toISOString().split("T")[0], item.sum])
  );

  // Date formatter for the required format
  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" });

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
