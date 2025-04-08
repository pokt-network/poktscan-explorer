import { getClient } from '@/app/config/apollo/rsc'
import { getServicesPerformanceVariables, servicesPerformanceDocument } from '@/app/dashboards/services/operations'
import PerformanceTable from '@/app/dashboards/services/PerformanceTable/Table'
import React, { Suspense } from 'react'
import { getLatestBlock } from '@/app/api/blocks'
import PerformanceTableCard from '@/app/dashboards/services/PerformanceTable/Card'
import PerformanceTableLoader from './Loader'
import DataProvider from '@/app/context/DataContext'
import PerformanceCardActions from '@/app/dashboards/services/PerformanceTable/CardActions'

interface ServicesPerformanceTableProps {
  timeSelected: string
}

async function ServerServicesPerformanceTable({timeSelected}: ServicesPerformanceTableProps) {
  const latestBlock = await getLatestBlock()

  const {data} = await getClient().query({
    query: servicesPerformanceDocument,
    variables: getServicesPerformanceVariables(latestBlock.timestamp, timeSelected)
  })

  return (
    <DataProvider initialData={[]}>
      <PerformanceTableCard
        timeSelected={timeSelected}
        actions={(
          <PerformanceCardActions />
        )}
      >
        <PerformanceTable initialData={data} timeSelected={timeSelected} />
      </PerformanceTableCard>
    </DataProvider>
  )
}

export default function ServicesPerformanceTable({timeSelected}: ServicesPerformanceTableProps) {
  return (
    <Suspense
      key={timeSelected}
      fallback={
        <PerformanceTableLoader timeSelected={timeSelected} />
      }
    >
      <ServerServicesPerformanceTable timeSelected={timeSelected} />
    </Suspense>
  )
}
