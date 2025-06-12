'use client'
import BaseLineBarChart from '@/app/Charts/BaseLineBarChart/BaseLineBarChart'
import type { DataItem } from '@/app/dashboards/services/Productivity/Chart'
import millify from 'millify'

export default function LineChartLoader() {
  return (
    <BaseLineBarChart
      yAxisKey={'avgComputedUnits'}
      yAxisLabel={''}
      chartType={'line'}
      isLoading={true}
      data={{} as Record<string, Array<DataItem>>}
      customOptions={{
        scales: {
          x: {
            grid: {
              display: false
            },
          },
          y: {
            grace: '0%',
            border: {
              display: false,
            },
            title: {
              display: false
            },
            grid: {
              display: false,
            },
            min: 0,
            max: 100,
            ticks: {
              stepSize: 25,
              callback: function(value, index, ticks) {
                if (index === 0 || index === ticks.length - 1 || index === 2) {
                  return millify(Number(value));
                }
              }
            }
          }
        }
      }}
      customDataLoaderProps={{
        includeMonthToDate: true
      }}
    />
  )
}
