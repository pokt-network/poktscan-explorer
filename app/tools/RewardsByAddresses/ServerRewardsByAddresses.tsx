import { cookies } from 'next/headers'
import { getLatestBlock } from '@/app/api/blocks'
import {
  rewardsByAddressAndTimeGroupByDateDocument,
  rewardsByAddressAndTimeGroupByDateVariables,
} from '@/app/tools/RewardsByAddresses/operations'
import { getClient } from '@/app/config/apollo/rsc'
import DataProvider from '@/app/context/DataContext'
import { ChartTypeProvider } from '@/app/Charts/ChartType'
import { chartTypeCookieKey } from '@/app/tools/RewardsByAddresses/constants'
import RewardsByAddressCard from '@/app/tools/RewardsByAddresses/Card'
import RewardsByAddressChart from '@/app/tools/RewardsByAddresses/RewardsByAddressChart'
import CardActions from '@/app/tools/RewardsByAddresses/CardActions'
import { MultipleOptionContextProvider } from '@/app/context/MultipleOptionContext'

interface RewardsByAddressesProps {
  addresses: Array<string>
  timeSelected: string
}

export default async function ServerRewardsByAddresses({addresses, timeSelected}: RewardsByAddressesProps) {
  let data, variables, error = false, cookiesAwaited: Awaited<ReturnType<typeof cookies>>

  if (addresses.length) {
    try {
      cookiesAwaited = await cookies()
      const latestBlock = await getLatestBlock()

      variables = rewardsByAddressAndTimeGroupByDateVariables(
        addresses,
        latestBlock.timestamp,
        timeSelected,
      )

      const response = await getClient().query({
        query: rewardsByAddressAndTimeGroupByDateDocument,
        variables,
      })

      data = response.data
    } catch {
      error = true
    }
  }

  return (
    <DataProvider
      initialData={[]}
    >
      <ChartTypeProvider defaultChartType={cookiesAwaited?.get(chartTypeCookieKey)?.value}>
        <MultipleOptionContextProvider initialValue={false}>
          <RewardsByAddressCard
            actions={(
              <CardActions />
            )}
          >
            <RewardsByAddressChart
              initialData={data}
              initialError={error}
              initialAddresses={addresses}
              initialVariables={variables || null}
            />
          </RewardsByAddressCard>
        </MultipleOptionContextProvider>
      </ChartTypeProvider>
    </DataProvider>
  )
}
