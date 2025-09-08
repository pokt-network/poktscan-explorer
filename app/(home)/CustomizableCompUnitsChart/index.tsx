import React from 'react'
import { cookies } from 'next/headers'
import DataProvider from '@/app/context/DataContext'
import { getValidTime, Time } from '@/app/utils/dates'
import { ChartTypeProvider } from '@/app/Charts/ChartType'
import CompUnitsActions from '@/app/(home)/CustomizableCompUnitsChart/Actions'
import { SelectedTimeProvider, TimeSelector } from '@/app/Charts/SelectedTime'
import CustomizableCompUnitsChart from '@/app/(home)/CustomizableCompUnitsChart/Chart'
import { chartTypeCookieKey, containerId, timeCookieKey } from '@/app/(home)/CustomizableCompUnitsChart/constants'

export default async function CustomizableCompUnits() {
  const awaitedCookies = await cookies()

  const time = getValidTime(
    awaitedCookies.get(timeCookieKey)?.value || '',
    Time.Last30d
  )

  return (
    <SelectedTimeProvider defaultTime={time}>
      <ChartTypeProvider defaultChartType={awaitedCookies.get(chartTypeCookieKey)?.value}>
        <DataProvider initialData={[]}>
          <div id={containerId} className={"h-[450px] w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
            <div className={'flex flex-row px-4 pt-3 pb-1 items-start sm:items-center justify-between flex-wrap gap-2'}>
              <div className={'flex flex-col sm:flex-row sm:items-center gap-2 sm:h-7'}>
                <div className={'flex flex-row items-center gap-2'}>
                  <p className={'text-lg font-semibold leading-7'}>
                    Computed Units
                  </p>
                  <TimeSelector
                    includeLabel={false}
                    cookieKey={timeCookieKey}
                  />
                </div>
              </div>
              <CompUnitsActions />
            </div>
            <CustomizableCompUnitsChart />
          </div>

        </DataProvider>
      </ChartTypeProvider>
    </SelectedTimeProvider>
  )
}
