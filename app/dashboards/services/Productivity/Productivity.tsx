import { getLatestBlock } from '@/app/api/blocks'
import { getClient } from '@/app/config/apollo/rsc'
import { getProductivityVariables, productivityQuery } from '@/app/dashboards/services/operations'
import React from 'react'
import ServicesProductivityChart from '@/app/dashboards/services/Productivity/Chart'
import { cookies } from 'next/headers'
import { selectedServicesCookieKey } from '@/app/dashboards/services/Productivity/constants'
import { ChartTypeProvider } from '@/app/dashboards/services/Productivity/ChartType'
import { chartTypeCookieKey } from '@/app/dashboards/services/constants'
import ProductivityCard from '@/app/dashboards/services/Productivity/Card'
import DataProvider from '@/app/context/DataContext'
import CardActions from '@/app/dashboards/services/Productivity/CardActions'

interface ServicesProductivityProps {
  timeSelected: string
}

export default async function ServerServicesProductivity({timeSelected}: ServicesProductivityProps) {
  const latestBlock = await getLatestBlock()

  const variables = getProductivityVariables(latestBlock.timestamp, timeSelected)

  const [{data}, cookiesAwaited] = await Promise.all([
    getClient().query({
      query: productivityQuery,
      variables,
    }),
    cookies()
  ])

  return (
    <DataProvider
      initialData={[]}
    >
      <ChartTypeProvider defaultChartType={cookiesAwaited.get(chartTypeCookieKey)?.value}>
        <ProductivityCard
          timeSelected={timeSelected}
          actions={(
            <CardActions />
          )}
        >
          <ServicesProductivityChart
            timeSelected={timeSelected}
            initialData={data}
            initialVariables={variables}
            initialSelectedServices={
              cookiesAwaited.get(selectedServicesCookieKey)?.value?.split(',') || []
            }
          />
        </ProductivityCard>
      </ChartTypeProvider>
    </DataProvider>
  )
}
