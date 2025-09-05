import React from 'react'
import TimeBoxLabel from '@/app/tools/TimeBoxLabel'
import DataProvider from '@/app/context/DataContext'
import { containerId } from '@/app/tools/operator/constants'
import ClaimProofChartByDelegator from '@/app/tools/operator/ComparisonChart/Chart'
import ClaimProofsExpiredActions from '@/app/tools/operator/ComparisonChart/CardActions'

export default function ComparisonChart() {
  return (
    <DataProvider initialData={[]}>
      <div id={containerId} className={"h-[600px] md:h-[500px] w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
        <div className={'flex flex-row px-4 pt-3 pb-1 items-start sm:items-center justify-between'}>
          <div className={'flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 sm:h-7'}>
            <div className={'flex flex-row items-center gap-0 sm:gap-2'}>
              <p className={'text-lg font-semibold leading-7'}>
                Claims/Proofs/Expired
              </p>
              <TimeBoxLabel />
            </div>
          </div>
          <ClaimProofsExpiredActions />
        </div>
        <ClaimProofChartByDelegator />
      </div>
    </DataProvider>
  )
}
