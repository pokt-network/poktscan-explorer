'use client'

import { useDateContext } from '@/app/dates/Context'
import { format, formatDuration, intervalToDuration } from 'date-fns'
import { TZDate } from "@date-fns/tz";
import React from 'react'

export function useFormatDate() {
  const {formatText, dateTimeColumn, dateTimeZone} = useDateContext()

  return {
    formatDate: (value: string) => {
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
    }
  }
}

export default function DateCellText({value}: {value: string}) {
  const {formatDate} = useFormatDate()
 return (
   <span suppressHydrationWarning>
     {formatDate(value)}
   </span>
 )
}
