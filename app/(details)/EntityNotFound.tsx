import { CircleAlert } from 'lucide-react'
import React from 'react'

interface EntityNotFoundProps {
  id: string
  height?: number
}

export default function EntityNotFound({id, height = 200}: EntityNotFoundProps) {
  return (
    <div
      className="w-full flex flex-col justify-center items-center bg-[color:--main-background] p-4 rounded-lg border border-[color:--divider] gap-0 base-shadow"
      style={{
        height
      }}
    >
      <CircleAlert className={"h-9 w-9 sm:h-12 sm:w-12 text-[color:--warning]"}/>
      <p className={"text-sm sm:text-md text-center my-3 text-[color:--secondary]"}>
        We couldn&#39;t find any data for <span className={'font-semibold break-all'}>{id}</span> entity.
      </p>
    </div>
  )
}
