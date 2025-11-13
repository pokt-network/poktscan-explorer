import { cookies } from 'next/headers'
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

export default async function ServerRewardsByAddresses({addresses}: RewardsByAddressesProps) {
  const cookiesAwaited = await cookies()

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
              initialData={null}
              initialError={false}
              initialAddresses={addresses}
              initialVariables={null}
            />
          </RewardsByAddressCard>
        </MultipleOptionContextProvider>
      </ChartTypeProvider>
    </DataProvider>
  )
}
