import React from 'react'
import DataProvider from '@/app/context/DataContext'
import { getValidTime, Time } from '@/app/utils/dates'
import { ChartTypeProvider } from '@/app/Charts/ChartType'
import CompUnitsActions from '@/app/(home)/CustomizableCompUnitsChart/Actions'
import { SelectedTimeProvider, TimeSelector } from '@/app/Charts/SelectedTime'
import CustomizableCompUnitsChart from '@/app/(home)/CustomizableCompUnitsChart/LazyCompUnitsChart'
import { containerId, timeCookieKey } from '@/app/(home)/CustomizableCompUnitsChart/constants'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { customizableCompUnitsDocument } from '@/app/(home)/CustomizableCompUnitsChart/operations'

interface CustomizableCompUnitsProps {
  cookieTime?: string
  chartType?: string
  initialData?: DocumentNodeData<typeof customizableCompUnitsDocument> | null
  initialError?: boolean
}

export default function CustomizableCompUnits({cookieTime, chartType, initialData, initialError}: CustomizableCompUnitsProps) {
  const time = getValidTime(
    cookieTime || '',
    Time.Last30d
  )

  return (
    <SelectedTimeProvider defaultTime={time}>
      <ChartTypeProvider defaultChartType={chartType}>
        <DataProvider initialData={[]}>
          <div id={containerId} className={"h-[350px] w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
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
            <CustomizableCompUnitsChart initialData={initialData} initialError={initialError || false} />
          </div>

        </DataProvider>
      </ChartTypeProvider>
    </SelectedTimeProvider>
  )
}
