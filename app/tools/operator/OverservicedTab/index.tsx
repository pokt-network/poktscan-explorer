import React from 'react'
import TimeBoxLabel from '@/app/tools/TimeBoxLabel'
import DataProvider from '@/app/context/DataContext'
import { ChartTypeProvider } from '@/app/Charts/ChartType'
import { overservicedContainerId } from '@/app/tools/operator/constants'
import OverservicedChart from '@/app/tools/operator/OverservicedTab/Chart'
import OverservicedActions from '@/app/tools/operator/OverservicedTab/CardActions'

interface OverservicedTabProps {
  chartType?: string
}

export default function OverservicedTab({ chartType }: OverservicedTabProps) {
  return (
    <ChartTypeProvider defaultChartType={chartType}>
      <DataProvider initialData={[]}>
        <div id={overservicedContainerId} className={"h-[600px] md:h-[500px] w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
          <div className={'flex flex-row px-4 pt-3 pb-1 items-start sm:items-center justify-between'}>
            <div className={'flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 sm:h-7'}>
              <div className={'flex flex-row items-center gap-0 sm:gap-2'}>
                <p className={'text-lg font-semibold leading-7'}>
                  Overserviced
                </p>
                <TimeBoxLabel />
              </div>
            </div>
            <OverservicedActions />
          </div>
          <p className={'px-4 text-xs text-[color:--secondary] pb-1'}>
            This data comes from the EventApplicationOverserviced events, where Effective is the amount of POKT that the suppliers received and Expected was the amount of POKT they were expecting to receive.
          </p>
          <OverservicedChart />
        </div>
      </DataProvider>
    </ChartTypeProvider>
  )
}
