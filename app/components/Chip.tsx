import React from 'react'

interface ChipProps {
  values: Array<React.ReactNode>
}

export function ChipText({children, moreElements = 0}: {children: React.ReactNode, moreElements?: number}) {
  return (
    <div className={"flex flex-row grow gap-1.5 items-center"}>
      <div
        className={"flex flex-row items-center justify-center gap-1 bg-[color:--background] px-3 md:px-4 py-[2px] md:py-1 rounded-md border border-[color:--divider]"}>
        {typeof children === 'string' ? (
          <p className={"whitespace-nowrap overflow-hidden overflow-ellipsis text-[10px] md:text-xs"}>
            {children}
          </p>
        ) : children}

      </div>
      {moreElements > 0 && (
        <p className={"text-[color:--secondary] text-[10px] md:text-xs font-semibold"}>
          +{moreElements}
        </p>
      )}
    </div>
  )
}
export default function Chip({values}: ChipProps) {
  const firstValue = values.at(0) || 'Unknown'

  return (
    <ChipText
      moreElements={values.length - 1}
    >
      {firstValue}
    </ChipText>
  )
}
