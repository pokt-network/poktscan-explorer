import {
  addDaysToUtc,
  addHoursToUtc,
  getDateFromIsoString,
  getUtcEndOfDay,
  getUtcEndOfHour,
  getUtcStartOfDay,
  getUtcStartOfHour,
} from '@/app/Charts/utils'

export enum Time {
  Last24h = 'last24h',
  Last48h = 'last48h',
  Last7d = 'last7d',
  Last30d = 'last30d',
}

const hoursTime = [Time.Last24h, Time.Last48h]

export function getValidTime(time: string, defaultTime = Time.Last7d) {
  let timeSelected = defaultTime

  if (Object.values(Time).includes(time as Time)) {
    timeSelected = time as Time
  }

  return timeSelected
}

export function getStartAndEndDateBasedOnTime(dateStr: string, timeStr: string, endAndStartOfUnit = false) {
  const time = getValidTime(timeStr)

  let end = getDateFromIsoString(dateStr)

  let start: Date

  switch (time) {
    case Time.Last24h: {
      start = addHoursToUtc(end, -23)
      break
    }
    case Time.Last48h: {
      start = addHoursToUtc(end, -47)
      break
    }
    case Time.Last7d: {
      start = addDaysToUtc(end, -6)
      break
    }
    case Time.Last30d: {
      start = addDaysToUtc(end, -29)
      break
    }
  }

  if (endAndStartOfUnit) {
    const isHours = hoursTime.includes(time)
    end = isHours ? getUtcEndOfHour(end) : getUtcEndOfDay(end)
    start = isHours ? getUtcStartOfHour(start) : getUtcStartOfDay(start)
  }

  return {
    start,
    end,
    truncInterval: hoursTime.includes(time) ? 'hour' as const : 'day' as const,
  }
}

export function getStartMiddleAndEndDateBasedOnTime(
  dateStr: string,
  timeStr: string,
  endAndStartOfUnit = false
) {
  const time = getValidTime(timeStr)

  let end = getDateFromIsoString(dateStr)

  let start: Date, middle: Date

  switch (time) {
    case Time.Last24h: {
      middle = addHoursToUtc(end, -23)
      start = addHoursToUtc(middle, -23)
      break
    }
    case Time.Last48h: {
      middle = addHoursToUtc(end, -47)
      start = addHoursToUtc(middle, -47)
      break
    }
    case Time.Last7d: {
      middle = addDaysToUtc(end, -6)
      start = addDaysToUtc(middle, -6)
      break
    }
    case Time.Last30d: {
      middle = addDaysToUtc(end, -29)
      start = addDaysToUtc(middle, -29)
      break
    }
  }

  if (endAndStartOfUnit) {
    const isHours = hoursTime.includes(time)
    end = isHours ? getUtcEndOfHour(end) : getUtcEndOfDay(end)
    start = isHours ? getUtcStartOfHour(start) : getUtcStartOfDay(start)
    middle = isHours ? getUtcStartOfHour(middle) : getUtcStartOfDay(middle)
  }

  return {
    start,
    middle,
    end,
    truncInterval: hoursTime.includes(time) ? 'hour' as const : 'day' as const,
  }
}

export function getTimeBoxLabel(time: string) {
  let timeToUse = Time.Last7d

  if (time && (Object.values(Time).includes(time as Time) || time === 'last48h')) {
    timeToUse = time as Time
  }

  switch (timeToUse) {
    case Time.Last24h: {
      return '24H'
    }
    case Time.Last48h: {
      return '48H'
    }
    case Time.Last7d: {
      return '7D'
    }
    case Time.Last30d: {
      return '30D'
    }
  }
}
