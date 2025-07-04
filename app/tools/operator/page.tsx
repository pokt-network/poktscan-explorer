import { PageProps } from '@/app/types/pages'
import { OperatorTabs, selectedTimeCookieKey, selectedTimeParamKey } from './constants'
import { cookies } from 'next/headers'
import React, { Suspense } from 'react'
import { getValidAddresses } from '@/app/tools/utils'
import LastClaimingWindowTableLoader from '@/app/tools/operator/ClaimProofTable/Loader'
import ServerLastClaimingWindowTable from '@/app/tools/operator/ClaimProofTable/Table'
import { getPageAndItems } from '@/app/utils/pagination'
import { LoadingTable } from '@/app/components/LoadingListView'
import SuppliersTable, { columns as supplierColumns } from '@/app/components/SuppliersTable/SuppliersTable'
import Tabs from '@/app/components/Tabs'
import SlashingTable, { slashedColumns } from '@/app/tools/operator/SlashingTable'
import NoData from '@/app/components/NoData'
import { getValidTime, Time } from '@/app/utils/dates'
import RewardsByServiceTable from '@/app/tools/operator/ServicesTab/Table'
import RewardsByServiceLoader from '@/app/tools/operator/ServicesTab/Loader'

const tabs = [
  {
    label: 'Claim/Proof Comparison',
    tab: OperatorTabs.ClaimProof
  },
  {
    label: 'Rewards by Service',
    tab: OperatorTabs.RewardsByService
  },
  {
    label: 'Slashing',
    tab: OperatorTabs.Slashing
  },
  {
    label: 'Suppliers',
    tab: OperatorTabs.Suppliers
  }
]

export default async function NodeRunningPage({searchParams}: PageProps) {
  const [searchParamsAwaited, cookiesAwaited] = await Promise.all([
    searchParams,
    cookies()
  ])

  const selectedTimeFromCookie = cookiesAwaited.get(selectedTimeCookieKey)?.value

  let selectedTime: Time = getValidTime(
    selectedTimeFromCookie || ''
  )

  const selectedTimeFromSearchParams = searchParamsAwaited?.[selectedTimeParamKey] as string

  if (selectedTimeFromSearchParams && Object.values(Time).includes(selectedTimeFromSearchParams as Time)) {
    selectedTime = selectedTimeFromSearchParams as Time
  }

  const validAddresses = getValidAddresses(searchParamsAwaited?.addresses as string)

  let activeTab = OperatorTabs.ClaimProof

  if (Object.values(OperatorTabs).includes(searchParamsAwaited.tab as OperatorTabs)) {
    activeTab = searchParamsAwaited.tab as OperatorTabs
  }

  let content: React.ReactNode

  if (activeTab === OperatorTabs.ClaimProof) {
    content = (
      <Suspense
        key={validAddresses.join(',') + selectedTime}
        fallback={(
          <>
            <LastClaimingWindowTableLoader />
          </>
        )}
      >
        <ServerLastClaimingWindowTable addresses={validAddresses} time={selectedTime} />
      </Suspense>
    )
  } else if (activeTab === OperatorTabs.RewardsByService) {
    content = (
      <Suspense
        key={validAddresses.join(',') + selectedTime}
        fallback={(
          <RewardsByServiceLoader />
        )}
      >
        <RewardsByServiceTable addresses={validAddresses} time={selectedTime} />
      </Suspense>
    )
  } else {
    if (validAddresses.length === 0) {
      content = (
        <div className={"h-[400px] w-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
          <NoData label={'Please enter a comma-separated list of addresses to search for.'} />
        </div>
      )
    } else {
      const [{page, itemsPerPage}, sParams] = await Promise.all([
        getPageAndItems(searchParams),
        searchParams
      ])

      const activeFilter = typeof sParams.filter === 'string' ? sParams.filter : undefined
      const isSuppliers = activeTab === OperatorTabs.Suppliers

      const Table = isSuppliers ? SuppliersTable : SlashingTable

      content = (
        <Suspense
          key={`${activeTab as string}-${new Date().toISOString()}`}
          fallback={
            <LoadingTable
              columns={
                isSuppliers ? supplierColumns : slashedColumns
              }
              rowsAmount={itemsPerPage}
            />
          }
        >
          <Table
            page={page}
            delegators={validAddresses}
            itemsPerPage={itemsPerPage}
            basePath={`/tools/operator?addresses=${validAddresses.join(',')}&tab=${activeTab}`}
            activeFilter={activeFilter}
          />
        </Suspense>
      )
    }
  }

  return (
    <div className={'flex gap-4 flex-col'}>
      <hr className={'border-[color:--divider]'} />
      <Tabs
        basePath={`/tools/operator?addresses=${validAddresses.join(',')}`}
        activeTab={activeTab as string}
        tabs={tabs}
      />

      {content}
    </div>
  )
}
