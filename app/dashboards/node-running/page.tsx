import type { PageProps } from '@/app/types/pages'
import React from 'react'
import { cookies } from 'next/headers'
import { selectedTimeCookieKey, selectedTimeParamKey } from '@/app/dashboards/node-running/constants'
import TimeSelector from '@/app/components/TimeSelector'
import { getValidTime, Time } from '@/app/utils/dates'
import ComparisonCharts from '@/app/dashboards/node-running/ComparisonCharts'

export default async function NodeRunningPage({searchParams}: PageProps) {
  const [cookiesAwaited, searchParamsAwaited] = await Promise.all([
    cookies(),
    searchParams
  ])

  const selectedTimeFromSearchParams = searchParamsAwaited?.[selectedTimeParamKey] as string
  const selectedTimeFromCookie = cookiesAwaited.get(selectedTimeCookieKey)?.value

  let selectedTime: Time = getValidTime(
    selectedTimeFromCookie || ''
  )

  if (selectedTimeFromSearchParams && Object.values(Time).includes(selectedTimeFromSearchParams as Time)) {
    selectedTime = selectedTimeFromSearchParams as Time
  }

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex min-h-[calc(100dvh-53px-57px-70px)] flex-col"}>
      <div className={'flex flex-row items-center gap-4 justify-between'}>
        <h1 className={'text-lg font-medium'}>
          Node Running
        </h1>

        <TimeSelector
          selectedTime={selectedTime}
          cookie={selectedTimeCookieKey}
          param={selectedTimeParamKey}
        />
      </div>

      <hr className={'border-[color:--divider] mb-2'} />

      <ComparisonCharts selectedTime={selectedTime} />
    </div>
  )
}
