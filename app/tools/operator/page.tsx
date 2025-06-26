import { PageProps } from '@/app/types/pages'
import {
  selectedTimeCookieKey,
  selectedTimeParamKey,
  TimeClaimProofTable,
} from './constants'
import { cookies } from 'next/headers'
import React, { Suspense } from 'react'
import { getValidAddresses } from '@/app/tools/utils'
import ClaimProofTableTimeSelector from '@/app/tools/operator/ClaimProofTable/ClaimProofTableTimeSelector'
import { MultipleOptionContextProvider } from '@/app/context/MultipleOptionContext'
import LastClaimingWindowTableLoader from '@/app/tools/operator/ClaimProofTable/Loader'
import ServerLastClaimingWindowTable from '@/app/tools/operator/ClaimProofTable/Table'

export default async function NodeRunningPage({searchParams}: PageProps) {
  const [searchParamsAwaited, cookiesAwaited] = await Promise.all([
    searchParams,
    cookies()
  ])

  let selectedTime = TimeClaimProofTable.Last24h

  const selectedTimeFromSearchParams = searchParamsAwaited?.[selectedTimeParamKey] as string

  if (selectedTimeFromSearchParams && Object.values(TimeClaimProofTable).includes(selectedTimeFromSearchParams as TimeClaimProofTable)) {
    selectedTime = selectedTimeFromSearchParams as TimeClaimProofTable
  }

  const selectedTimeFromCookie = cookiesAwaited.get(selectedTimeCookieKey)?.value

  if (selectedTimeFromCookie && Object.values(TimeClaimProofTable).includes(selectedTimeFromCookie as TimeClaimProofTable)) {
    selectedTime = selectedTimeFromCookie as TimeClaimProofTable
  }

  const validAddresses = getValidAddresses(searchParamsAwaited?.addresses as string)

  return (
    <div>
      <hr className={'border-[color:--divider]'} />
      <MultipleOptionContextProvider initialValue={selectedTime}>
        <Suspense
          key={validAddresses.join(',') + selectedTime}
          fallback={(
            <>
              <ClaimProofTableTimeSelector initialValue={selectedTime} disable={true} />
              <LastClaimingWindowTableLoader />
            </>
          )}
        >
          <ClaimProofTableTimeSelector initialValue={selectedTime} />
          <ServerLastClaimingWindowTable addresses={validAddresses} time={selectedTime} />
        </Suspense>
      </MultipleOptionContextProvider>
    </div>
  )
}
