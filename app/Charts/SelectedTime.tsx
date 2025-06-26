'use client'
import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { setCookie } from '@/app/utils/cookies'
import {
  Time,
} from '@/app/dashboards/services/constants'

interface SelectedTimeContextProps {
  selectedTime: Time;
  setSelectedTime: (time: Time) => void;
}

const SelectedTimeContext = React.createContext<SelectedTimeContextProps>({
  selectedTime: Time.Last7d,
  setSelectedTime: () => {},
})

interface SelectedTimeProviderProps {
  defaultTime: Time;
  children: React.ReactNode
}

function SelectedTimeProvider({children, defaultTime}: SelectedTimeProviderProps) {
  const [selectedTime, setSelectedTime] = useState<Time>(defaultTime)

  return (
    <SelectedTimeContext.Provider value={{selectedTime, setSelectedTime}}>
      {children}
    </SelectedTimeContext.Provider>
  )
}

function useSelectedTime() {
  const context = React.useContext(SelectedTimeContext)

  if (!context) {
    throw new Error('useSelectedTime must be used within a SelectedTimeProvider')
  }

  return context
}

const labelByTime: Record<Time, string> = {
  [Time.Last24h]: 'Last 24h',
  [Time.Last7d]: 'Last 7d',
  [Time.Last30d]: 'Last 30d',
  [Time.Last90d]: 'Last 90d',
}

interface TimeSelectorProps {
  includeLabel?: boolean;
  options?: Time[];
  cookieKey?: string;
}

function TimeSelector({
  cookieKey,
  includeLabel = true,
  options = [Time.Last24h, Time.Last7d, Time.Last30d, Time.Last90d],
}: TimeSelectorProps) {
  const {selectedTime, setSelectedTime} = useSelectedTime()

  return (
    <div className={'flex flex-row items-center gap-3 h-[30px]'}>
      {includeLabel && (
        <label className={'text-sm'}>
          Time
        </label>
      )}
      <Select
        value={selectedTime}
        onValueChange={(newValue) => {
          setSelectedTime(newValue as Time)
          if (cookieKey) {
            setCookie(cookieKey, newValue)
          }
        }}
      >
        <SelectTrigger className={'w-[84px] px-2 sm:w-[90px] h-[26px] sm:h-[26px] text-xs bg-[color:--main-background]'}>
          <SelectValue placeholder={'Time'} />
        </SelectTrigger>
        <SelectContent>
          {options?.map(option => (
            <SelectItem value={option} key={option}>
              {labelByTime[option] || option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export {
  SelectedTimeProvider,
  TimeSelector,
  useSelectedTime
}
