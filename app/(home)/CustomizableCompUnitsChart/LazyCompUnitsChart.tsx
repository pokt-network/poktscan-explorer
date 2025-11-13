'use client'

import dynamic from 'next/dynamic'
import BaseLineBarChart from '@/app/Charts/BaseLineBarChart/BaseLineBarChart'

const LazyCompUnitsChart = dynamic(() => import('./Chart'), {
  ssr: false,
  loading: () => (
    <div className={'pt-2 px-4 h-[calc(100%-60px)]'}>
      <BaseLineBarChart
        data={{
          '': []
        }}
        yAxisKey={'totalComputedUnits'}
        yAxisLabel={'Computed Units'}
        isLoading={true}
        chartType={'line'}
        unitToFormatDate={'day'}
        displayColorsInTooltip={false}
        getCustomDatasetProps={() => {
          return {
            tension: 0.5,
            pointRadius: 8,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            pointHoverRadius: 8,
            pointBorderColor: 'transparent',
            pointBackgroundColor: 'transparent',
            pointBorderWidth: 0,
            borderWidth: 1.5,
          }
        }}
      />
    </div>
  )
})

export default LazyCompUnitsChart
