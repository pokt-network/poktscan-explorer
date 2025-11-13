import React, { Suspense } from 'react'
import RewardsByAddressesLoader from '@/app/tools/RewardsByAddresses/Loader'
import ServerRewardsByAddresses from '@/app/tools/RewardsByAddresses/ServerRewardsByAddresses'
import { Time } from '@/app/utils/dates'
import Summary from '@/app/tools/Summary/Summary'

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
          <Summary
            isOwners={isOwner}
            initialAddresses={validAddresses}
            initialData={null}
            initialError={false}
          />
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
