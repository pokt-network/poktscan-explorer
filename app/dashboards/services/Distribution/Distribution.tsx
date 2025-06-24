import { getClient } from '@/app/config/apollo/rsc'
import { distributionDocument, getDistributionVariables } from '@/app/dashboards/services/operations'
import { getLatestBlock } from '@/app/api/blocks'
import React, { Suspense } from 'react'
import DistributionChart from '@/app/dashboards/services/Distribution/Chart'
import Card from '@/app/dashboards/services/Distribution/Card'
import Loader from '@/app/dashboards/services/Distribution/Loader'
import DistributionCardActions from '@/app/dashboards/services/Distribution/CardActions'
import DataProvider from '@/app/context/DataContext'

interface DistributionProps {
  timeSelected: string
}

async function ServerDistribution({timeSelected}: DistributionProps) {
  let data, error = false

  try {
    const latestBlock = await getLatestBlock()
    const response = await getClient().query({
      query: distributionDocument,
      variables: getDistributionVariables(latestBlock.timestamp, timeSelected)
    })

    data = response.data
  } catch {
    error = true
  }

  return (
    <DataProvider initialData={[]}>
      <Card
        timeSelected={timeSelected}
        actions={(
          <DistributionCardActions />
        )}
      >
        <DistributionChart initialData={data} initialError={error} timeSelected={timeSelected} />
      </Card>
    </DataProvider>
  )
}

export default function Distribution({timeSelected}: DistributionProps) {
  return (
    <Suspense
      key={timeSelected}
      fallback={
        <Loader timeSelected={timeSelected} />
      }
    >
      <ServerDistribution timeSelected={timeSelected} />
    </Suspense>
  )
}
