import ServicesPerformanceTable from '@/app/dashboards/services/PerformanceTable/Performance'
import React from 'react'
import Distribution from '@/app/dashboards/services/Distribution/Distribution'
import ServicesProductivity from '@/app/dashboards/services/Productivity/Productivity'
import TimeSelector from '@/app/components/TimeSelector'
import { cookies } from 'next/headers'
import { PageProps } from '@/app/types/pages'
import {
  chartTypeCookieKey,
  selectedTimeCookieKey,
  selectedTimeParamKey,
} from '@/app/dashboards/services/constants'
import ServicesProductivityLoader from '@/app/dashboards/services/Productivity/Loader/Loader'
import { getValidTime, Time } from '@/app/utils/dates'

export default async function DashboardServicesPage({searchParams}: PageProps) {
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
          Services
        </h1>

        <TimeSelector
          selectedTime={selectedTime}
          cookie={selectedTimeCookieKey}
          param={selectedTimeParamKey}
        />
      </div>
      <hr className={'border-[color:--divider] mb-2'} />

      <div className={'flex flex-col xl:flex-row gap-4'}>
        <ServicesPerformanceTable timeSelected={selectedTime} />
        <Distribution timeSelected={selectedTime} />
      </div>

      <ServicesProductivityLoader
        timeSelected={selectedTime}
        chartType={(cookiesAwaited.get(chartTypeCookieKey)?.value || 'line') as 'line' | 'bar'}
      >
        <ServicesProductivity
          timeSelected={selectedTime}
        />
      </ServicesProductivityLoader>
    </div>
  )
}
