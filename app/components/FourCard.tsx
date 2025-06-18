import React from 'react'

export interface CardItem {
  label: string
  children: React.ReactNode
}

interface FourCardsProps {
  items: [CardItem, CardItem, CardItem, CardItem]
}

export default function FourCard({items}: FourCardsProps) {
  return (
    <div className={"grid xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xs:grid-rows-4 sm:grid-rows-2 lg:grid-rows-1 gap-4"}>
      {items.map((item) => (
        <div key={item.label} className={"bg-[color:--main-background] m-h-80 w-100 p-4 gap-1 rounded-lg border border-[color:--divider] base-shadow"}>
          <p className={"text-xs text-[color:--secondary]"}>
            {item.label}
          </p>
          {item.children}
        </div>
      ))}
    </div>
  )
}
