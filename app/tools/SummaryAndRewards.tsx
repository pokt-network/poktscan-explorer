import React, { Suspense } from 'react'
import { LoadingSummary } from '@/app/components/LoadingListView'
import { labels } from '@/app/tools/Summary/constants'
import ServerSummary from '@/app/tools/Summary/ServerSummary'
import RewardsByAddressesLoader from '@/app/tools/RewardsByAddresses/Loader'
import ServerRewardsByAddresses from '@/app/tools/RewardsByAddresses/ServerRewardsByAddresses'
import { Time } from '@/app/utils/dates'

interface SummaryAndRewardsProps {
  validAddresses: Array<string>
  rewardsChartTime: Time
  chartType: string
  isOwner: boolean
}

export default function SummaryAndRewards({
  validAddresses,
  rewardsChartTime,
  chartType,
  isOwner,
}: SummaryAndRewardsProps) {
  return (
    <>
      <div className={'flex flex-col gap-4'}>

        <div className={'min-w-[260px]'}>
          <Suspense
            key={validAddresses.join(',')}
            fallback={
              <LoadingSummary labels={labels} />
            }
          >
            <ServerSummary addresses={validAddresses} isOwners={isOwner} />
          </Suspense>
        </div>

        <Suspense
          key={validAddresses.join(',')}
          fallback={
            <RewardsByAddressesLoader chartType={chartType as 'line'} />
          }
        >
          <ServerRewardsByAddresses
            addresses={validAddresses}
            timeSelected={rewardsChartTime}
          />
        </Suspense>
      </div>
    </>
  )
}
