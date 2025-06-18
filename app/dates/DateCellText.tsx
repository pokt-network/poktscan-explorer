'use client'

import { useDateContext } from '@/app/dates/Context'
import { format, formatDuration, intervalToDuration } from 'date-fns'
import { TZDate } from "@date-fns/tz";
import React, { useCallback, useEffect, useState } from 'react'

export function useFormatDate() {
  const {formatText, dateTimeColumn, dateTimeZone} = useDateContext()

  const formatDate = useCallback((value: string) => {
    // timestamps are in UTC, so we need to add the Z to the end because the api doesn't include it
    value = value + 'Z'
    if (dateTimeColumn === 'age') {
      return formatDuration(
        intervalToDuration({
          start: new Date(value),
          end: new Date()
        }),
        {
          delimiter: ',',
        }
      ).split(',').at(0) + ' ago'
    }

    const date = dateTimeZone === 'utc' ? new TZDate(value, 'UTC') : new Date(value)

    return format(date, formatText)
  }, [dateTimeColumn, dateTimeZone, formatText])

  return {
    formatDate,
  }
}

export default function DateCellText({value}: {value: string}) {
  const {formatDate} = useFormatDate()
  const {dateTimeColumn} = useDateContext()

  const [formattedDate, setFormattedDate] = useState(formatDate(value))

  useEffect(() => {
    setFormattedDate(formatDate(value))

    if (dateTimeColumn === 'age') {
      const currentDate = new Date()
      const date = new Date(value.endsWith('Z') ? value : value + 'Z')

      const diff = Math.floor((currentDate.getTime() - date.getTime()) / 1000)

      if (diff < 3600) {
        const interval = setInterval(() => {
          setFormattedDate(formatDate(value))
        }, 1000)

        return () => clearInterval(interval)
      }
    }
    // eslint-disable-next-line
  }, [dateTimeColumn, value])

  return (
    <span suppressHydrationWarning>
      {formattedDate}
    </span>
  )
}
