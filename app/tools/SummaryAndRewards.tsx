import AddressesInput from '@/app/tools/operator/AddressesInput'
import React, { Suspense } from 'react'
import { LoadingSummary } from '@/app/components/LoadingListView'
import { labels } from '@/app/tools/Summary/constants'
import ServerSummary from '@/app/tools/Summary/ServerSummary'
import RewardsByAddressesLoader from '@/app/tools/RewardsByAddresses/Loader'
import ServerRewardsByAddresses from '@/app/tools/RewardsByAddresses/ServerRewardsByAddresses'
import { Time } from '@/app/dashboards/services/constants'

interface SummaryAndRewardsProps {
  validAddresses: Array<string>
  rewardsChartTime: Time
  chartType: string
  inputHelperText: string
  isOwner: boolean
  pushOnAddressChange?: boolean
}

export default function SummaryAndRewards({
  validAddresses,
  rewardsChartTime,
  chartType,
  inputHelperText,
  isOwner,
  pushOnAddressChange
}: SummaryAndRewardsProps) {
  return (
    <>
      <AddressesInput
        defaultValue={validAddresses.length ? validAddresses.join(',') : ''}
        inputHelperText={inputHelperText}
        pushOnChange={pushOnAddressChange}
      />

      <hr className={'border-[color:--divider] my-2'} />
      <div className={'flex flex-col lg:flex-row gap-4'}>

        <div className={'min-w-[260px]'}>
          <Suspense
            key={validAddresses.join(',')}
            fallback={
              <LoadingSummary labels={labels} containerClassName={'flex-col lg:!flex lg:[&_.card-container]:!h-[90px]'} />
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
