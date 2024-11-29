'use client'

import React, { createContext, useContext, useState } from 'react'
import { setCookie } from '@/app/utils/cookies'
import { dateTimeColumnField, dateTimeZoneField, formatTextField } from '@/app/dates/constants'

interface DatesContextProps {
  dateTimeColumn: 'age' | 'date-time'
  dateTimeZone: 'utc' | 'local'
  formatText: string
  changeDateTimeColumn: (newValue: 'age' | 'date-time') => void
  changeValues: (arg: Omit<DatesContextProps, 'changeDateTimeColumn' | 'changeValues'>) => void
}
export const DatesContext = createContext<DatesContextProps>({
  dateTimeColumn: 'age',
  dateTimeZone: 'utc',
  formatText: 'yyyy-MM-dd HH:mm:ss',
  changeDateTimeColumn: () => {},
  changeValues: () => {},
})

export function useDateContext() {
  const context = useContext(DatesContext)

  if (!context) {
    throw new Error('useDateContext must be used within a DatesProvider')
  }

  return context
}

interface DatesProviderProps {
  children: React.ReactNode
  defaultDateTimeColumn?: 'age' | 'date-time'
  defaultDateTimeZone?: 'utc' | 'local'
  defaultFormatText?: string
}

export default function DatesProvider({
  children,
  defaultDateTimeColumn = 'age',
  defaultDateTimeZone = 'utc',
  defaultFormatText = 'yyyy-MM-dd HH:mm:ss',
}: DatesProviderProps) {
  const [dateTimeColumn, setDateTimeColumn] = useState<'age' | 'date-time'>(defaultDateTimeColumn!)
  const [dateTimeZone, setDateTimeZone] = useState<'utc' | 'local'>(defaultDateTimeZone!)
  const [formatText, setFormatText] = useState(defaultFormatText!)

  return (
    <DatesContext.Provider
      value={{
        dateTimeColumn,
        dateTimeZone,
        formatText,
        changeDateTimeColumn: (newValue: 'age' | 'date-time') => {
          setCookie(dateTimeColumnField, newValue)
          setDateTimeColumn(newValue)
        },
        changeValues: (arg: Omit<DatesContextProps, 'changeDateTimeColumn' | 'changeValuesColumn'>) => {
          setCookie(formatTextField, arg.formatText)
          setCookie(dateTimeZoneField, arg.dateTimeZone)
          setCookie(dateTimeColumnField, arg.dateTimeColumn)

          setFormatText(arg.formatText)
          setDateTimeZone(arg.dateTimeZone)
          setDateTimeColumn(arg.dateTimeColumn)
        },
      }}
    >
      {children}
    </DatesContext.Provider>
  )
}
