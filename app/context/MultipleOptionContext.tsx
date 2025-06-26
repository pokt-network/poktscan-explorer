'use client'

import React from 'react'

interface MultipleOptionContext<T> {
  selectedValue: T
  setSelectedValue: (value: T) => void
}

const MultipleOptionContext = React.createContext<MultipleOptionContext<any>>({
  selectedValue: null,
  setSelectedValue: () => {}
})

interface MultipleOptionContextProviderProps<T> {
  children: React.ReactNode
  initialValue: T
}

function MultipleOptionContextProvider<T>({
  children,
  initialValue,
}: MultipleOptionContextProviderProps<T>) {
  const [selectedValue, setSelectedValue] = React.useState<T>(initialValue)

  return (
    <MultipleOptionContext.Provider
      value={{
        selectedValue,
        setSelectedValue,
      }}
    >
      {children}
    </MultipleOptionContext.Provider>
  )
}

function useMultipleOptionContext<T>() {
  const context = React.useContext(MultipleOptionContext)

  if (!context) {
    throw new Error('useMultipleOptionContext must be used within a MultipleOptionContextProvider')
  }

  return context as MultipleOptionContext<T>
}

export {
  MultipleOptionContextProvider,
  useMultipleOptionContext
}
