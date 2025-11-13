import PerformanceTable from '@/app/dashboards/services/PerformanceTable/Table'
import React from 'react'
import PerformanceTableCard from '@/app/dashboards/services/PerformanceTable/Card'
import DataProvider from '@/app/context/DataContext'
import PerformanceCardActions from '@/app/dashboards/services/PerformanceTable/CardActions'

interface ServicesPerformanceTableProps {
  timeSelected: string
}

export default function ServicesPerformanceTable({timeSelected}: ServicesPerformanceTableProps) {
  return (
    <DataProvider initialData={[]}>
      <PerformanceTableCard
        timeSelected={timeSelected}
        actions={(
          <PerformanceCardActions />
        )}
      >
        <PerformanceTable
          initialData={null}
          initialError={false}
          timeSelected={timeSelected}
        />
      </PerformanceTableCard>
    </DataProvider>
  )
}
