import React from 'react'

interface ChipProps {
  values: Array<React.ReactNode>
}

export default function Chip({values}: ChipProps) {
  const firstValue = values.at(0) || 'Unknown'

  return (
    <div className={"flex flex-row grow gap-1.5 items-center"}>
      <div
        className={"flex flex-row items-center justify-center gap-1 bg-[color:--background] px-3 md:px-4 py-[2px] md:py-1 rounded-md border border-[color:--divider]"}>
        {typeof firstValue === 'string' ? (
          <p className={"whitespace-nowrap overflow-hidden overflow-ellipsis text-[10px] md:text-xs"}>
            {firstValue}
          </p>
        ) : firstValue}

      </div>
      {values.length > 1 && (
        <p className={"text-[color:--secondary] text-[10px] md:text-xs font-semibold"}>
          +{values.length - 1}
        </p>
      )}
    </div>
  )
}
