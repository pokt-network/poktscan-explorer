'use client'

import { useDateContext } from '@/app/dates/Context'

export default function DateColumn() {
  const {dateTimeColumn, dateTimeZone, changeDateTimeColumn} = useDateContext()

  return (
    <span
      className={'dark:hover:text-blue-300 dark:text-[color:rgb(106,181,219)] font-medium dark:font-bold hover:text-blue-600 text-sky-600 cursor-pointer select-none'}
      onClick={() => {
        changeDateTimeColumn(dateTimeColumn === 'age' ? 'date-time' : 'age')
      }}
    >
      {dateTimeColumn === 'age' ? 'Age' : `Date Time (${dateTimeZone === 'utc' ? 'UTC' : 'Local'})`}
    </span>
  )
}
