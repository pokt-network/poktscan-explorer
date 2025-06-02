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
  const latestBlock = await getLatestBlock()
  const {data} = await getClient().query({
    query: distributionDocument,
    variables: getDistributionVariables(latestBlock.timestamp, timeSelected)
  })

  return (
    <DataProvider initialData={[]}>
      <Card
        timeSelected={timeSelected}
        actions={(
          <DistributionCardActions />
        )}
      >
        <DistributionChart initialData={data} timeSelected={timeSelected} />
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
