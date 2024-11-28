'use client'

import React, { useState } from 'react'
import BoxLabel from '@/app/components/BoxLabel'
import { CircleAlert } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { setCookie } from '@/app/utils/cookies'

interface ServiceCardContentProps {
  table: React.ReactNode;
  chart: React.ReactNode;
  defaultType: string;
  hasItems: boolean;
}

export default function ServiceCardContent({table, defaultType, chart, hasItems}: ServiceCardContentProps) {
  const [selectedType, setSelectedType] = useState(defaultType)

  let content: React.ReactNode

  if (hasItems) {
    content = selectedType === 'chart' ? chart : table
  } else {
    content = (
      <div className={'flex flex-col items-center justify-center h-full mt-[-40px] min-h-[300px]'}>
        <CircleAlert className={"h-12 w-12 text-[color:--warning]"}/>
        <p className={"text-sm font-semibold my-3 text-[color:--secondary]"}>
          No data available in the last 24 hours.
        </p>
      </div>
    )
  }

  return (
    <div className={'bg-[color:--main-background] w-full lg:w-[50%] pb-4 border-[color:--divider] border rounded-lg sm:h-[650px] base-shadow'}>
      <div className={'h-[50px] p-4 w-full flex items-center border-b border-[color:--divider] justify-between'}>
        <div className={'flex items-center gap-1'}>
          <p className={'font-semibold text-[15px]'}>
            Services
          </p>
          <BoxLabel label={'24H'} />
        </div>
        <Select
          value={selectedType}
          onValueChange={(newValue) => {
            setSelectedType(newValue)
            setCookie('dashboard_services_card', newValue)
          }}
        >
          <SelectTrigger className={"w-[80px] h-[30px] text-xs"}>
            <SelectValue placeholder={"Items"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={'chart'}>
              Chart
            </SelectItem>
            <SelectItem value={'table'}>
              Table
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {content}
    </div>
  )
}
