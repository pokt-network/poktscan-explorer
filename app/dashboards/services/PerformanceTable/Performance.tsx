import { getClient } from '@/app/config/apollo/rsc'
import {
  getServicesPerformanceVariables,
  servicesDocument,
  servicesPerformanceDocument,
} from '@/app/dashboards/services/operations'
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
  let data, error = false

  try {
    const latestBlock = await getLatestBlock()

    const response = await getClient().query({
      query: servicesPerformanceDocument,
      variables: getServicesPerformanceVariables(latestBlock.timestamp, timeSelected)
    })

    const moreServices = []

    // for some reason, even when there are less than 100 items, the response returns an endCursor
    let cursor = response.data.currentData.nodes.length === 100 ? response.data.currentData.pageInfo.endCursor : ''

    while (cursor) {
      const variables = getServicesPerformanceVariables(latestBlock.timestamp, timeSelected)

      delete variables.endPrevious

      const {data} = await getClient().query({
        query: servicesDocument,
        variables: {
          ...variables,
          cursor
        }
      })

      moreServices.push(...data.currentData.nodes)

      cursor = data.currentData.pageInfo.endCursor

      if (data.currentData.nodes.length < 100) break
    }

    data = {
      ...response.data,
      currentData: {
        ...response.data.currentData,
        nodes: [
          ...response.data.currentData.nodes,
          ...moreServices
        ]
      }
    }
  } catch {
    error = true
  }

  return (
    <DataProvider initialData={[]}>
      <PerformanceTableCard
        timeSelected={timeSelected}
        actions={(
          <PerformanceCardActions />
        )}
      >
        <PerformanceTable
          initialData={data}
          initialError={error}
          timeSelected={timeSelected}
        />
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
