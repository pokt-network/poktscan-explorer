import React from 'react'
import ServicesProductivityChart from '@/app/dashboards/services/Productivity/Chart'
import { ChartTypeProvider } from '@/app/Charts/ChartType'
import ProductivityCard from '@/app/dashboards/services/Productivity/Card'
import DataProvider from '@/app/context/DataContext'
import CardActions from '@/app/dashboards/services/Productivity/CardActions'

interface ServicesProductivityProps {
  timeSelected: string
  chartType?: 'line' | 'bar'
  selectedServices?: Array<string>
}

export default async function ServerServicesProductivity({timeSelected, selectedServices, chartType}: ServicesProductivityProps) {
  return (
    <DataProvider
      initialData={[]}
    >
      <ChartTypeProvider defaultChartType={chartType}>
        <ProductivityCard
          timeSelected={timeSelected}
          actions={(
            <CardActions />
          )}
        >
          <ServicesProductivityChart
            timeSelected={timeSelected}
            initialData={null}
            initialVariables={null}
            initialError={false}
            initialSelectedServices={selectedServices || []}
          />
        </ProductivityCard>
      </ChartTypeProvider>
    </DataProvider>
  )
}
