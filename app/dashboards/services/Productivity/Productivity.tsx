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
  let data, variables, error = false, cookiesAwaited: Awaited<ReturnType<typeof cookies>>
  try {
    cookiesAwaited = await cookies()

    const latestBlock = await getLatestBlock()
    variables = getProductivityVariables(latestBlock.timestamp, timeSelected)

    const response = await getClient().query({
      query: productivityQuery,
      variables,
    })

    data = response.data
  } catch {
    error = true
  }


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
            initialVariables={variables || null}
            initialError={error}
            initialSelectedServices={
              cookiesAwaited.get(selectedServicesCookieKey)?.value?.split(',') || []
            }
          />
        </ProductivityCard>
      </ChartTypeProvider>
    </DataProvider>
  )
}
