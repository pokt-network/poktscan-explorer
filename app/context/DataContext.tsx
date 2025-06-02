'use client'

import React, { createContext, useContext, useState } from 'react'

interface DataContextProps<T extends object> {
  data: Array<T>
  setData: (data: Array<T>) => void
}

const DataContext = createContext<DataContextProps<any>>({
  data: [],
  setData: () => {},
})

interface DataProviderProps<T extends object> {
  children: React.ReactNode
  initialData: Array<T>
}

export default function DataProvider<T extends object>({
  children,
  initialData,
}: DataProviderProps<T>) {
  const [data, setData] = useState<Array<T>>(initialData || [])

  return (
    <DataContext.Provider
      value={{
        data,
        setData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useDataContext<T extends object>() {
  const context = useContext(DataContext)

  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider')
  }

  return context as {
    setData: (data: Array<T>) => void
    data: Array<T>
  }
}
