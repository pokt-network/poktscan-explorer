'use client'
import React, { useState } from 'react'
import { Time } from '@/app/utils/dates'
import ComponentTimeSelector from '@/app/components/TimeSelector'

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

interface TimeSelectorProps {
  includeLabel?: boolean;
  options?: Time[];
  cookieKey?: string;
  paramKey?: string;
  enablePush?: boolean
}

function TimeSelector({
  cookieKey,
  paramKey,
  enablePush,
  includeLabel = true,
  options = Object.values(Time),
}: TimeSelectorProps) {
  const {selectedTime, setSelectedTime} = useSelectedTime()

  return (
    <ComponentTimeSelector
      includeLabel={includeLabel}
      cookie={cookieKey}
      param={paramKey}
      options={options}
      selectedTime={selectedTime}
      onChange={setSelectedTime}
      enablePush={enablePush}
    />
  )
}

export {
  SelectedTimeProvider,
  TimeSelector,
  useSelectedTime
}
