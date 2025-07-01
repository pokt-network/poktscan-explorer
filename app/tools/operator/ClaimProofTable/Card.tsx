import React from 'react'
import ClaimProofTableTimeSelector from '@/app/tools/operator/ClaimProofTable/ClaimProofTableTimeSelector'
import { TimeClaimProofTable } from '@/app/tools/operator/constants'

interface ByTimeTableCardProps {
  children: React.ReactNode
  actions?: React.ReactNode
  disableTimeSelector?: boolean
  initialSelectedTime?: string
}

export default function LastClaimingWindowTableCard({
  children,
  actions,
  disableTimeSelector,
  initialSelectedTime,
}: ByTimeTableCardProps) {
  return (
    <div className={"md:min-h-[400px] h-full w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <div className={'flex mb-2 flex-row px-4 pt-3 pb-1 items-center justify-between'}>
        <div className={'flex flex-row items-center gap-2 h-7'}>
          <p className={'text-lg font-semibold leading-7'}>
            Claim/Proof Comparison
          </p>
          <ClaimProofTableTimeSelector
            disable={disableTimeSelector}
            initialValue={initialSelectedTime as TimeClaimProofTable}
          />
        </div>

        {actions}
      </div>

      {children}
    </div>
  )
}
