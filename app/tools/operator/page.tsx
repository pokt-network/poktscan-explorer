import { PageProps } from '@/app/types/pages'
import {
  maxAddresses,
  selectedTimeCookieKey,
  selectedTimeParamKey,
  Time,
} from './constants'
import { cookies } from 'next/headers'
import React from 'react'
import { isValidPoktAddress } from '@/app/utils/poktroll'
import ByTimeTable from './ByTimeTable/Table'
import AddressesInput from './AddressesInput'
import LastClaimingWindowTable from './LastClaimingWindowTable/Table'

export default async function NodeRunningPage({searchParams}: PageProps) {
  const [searchParamsAwaited, cookiesAwaited] = await Promise.all([
    searchParams,
    cookies()
  ])

  const addresses = searchParamsAwaited?.addresses as string
  let selectedTime: string = Time.Last24h

  const selectedTimeFromSearchParams = searchParamsAwaited?.[selectedTimeParamKey] as string

  if (selectedTimeFromSearchParams && Object.values(Time).includes(selectedTimeFromSearchParams as Time)) {
    selectedTime = selectedTimeFromSearchParams
  }

  const selectedTimeFromCookie = cookiesAwaited.get(selectedTimeCookieKey)?.value

  if (selectedTimeFromCookie && Object.values(Time).includes(selectedTimeFromCookie as Time)) {
    selectedTime = selectedTimeFromCookie
  }

  const validAddresses = typeof addresses === 'string' ? addresses.split(',').filter(isValidPoktAddress).slice(0, maxAddresses) : []

  return (
    <div className={"px-3 py-5 md:px-4 gap-6 flex min-h-[calc(100dvh-53px-57px-70px)] flex-col"}>
      <div className={'flex flex-row items-center gap-4 justify-between'}>
        <h1 className={'text-lg font-medium'}>
          Node Running
        </h1>
      </div>
      <hr className={'border-[color:--divider] mb-2'} />
      <AddressesInput defaultValue={validAddresses.length ? validAddresses.join(',') : ''} />

      {validAddresses.length > 0 && (
        <>
          <hr className={'border-[color:--divider] my-2'} />
          <LastClaimingWindowTable addresses={validAddresses} />
          <ByTimeTable timeSelected={selectedTime} addresses={validAddresses} />
        </>
      )}
    </div>
  )
}
