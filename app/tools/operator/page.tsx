import { PageProps } from '@/app/types/pages'
import { OperatorTabs, selectedTimeCookieKey, selectedTimeParamKey, TimeClaimProofTable } from './constants'
import { cookies } from 'next/headers'
import React, { Suspense } from 'react'
import { getValidAddresses } from '@/app/tools/utils'
import { MultipleOptionContextProvider } from '@/app/context/MultipleOptionContext'
import LastClaimingWindowTableLoader from '@/app/tools/operator/ClaimProofTable/Loader'
import ServerLastClaimingWindowTable from '@/app/tools/operator/ClaimProofTable/Table'
import { getPageAndItems } from '@/app/utils/pagination'
import { LoadingTable } from '@/app/components/LoadingListView'
import SuppliersTable, { columns as supplierColumns } from '@/app/components/SuppliersTable/SuppliersTable'
import Tabs from '@/app/components/Tabs'
import SlashingTable, { slashedColumns } from '@/app/tools/operator/SlashingTable'

const tabs = [
  {
    label: 'Claim/Proof Comparison',
    tab: OperatorTabs.ClaimProof
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

  let activeTab = OperatorTabs.ClaimProof

  if (Object.values(OperatorTabs).includes(searchParamsAwaited.tab as OperatorTabs)) {
    activeTab = searchParamsAwaited.tab as OperatorTabs
  }

  let content: React.ReactNode

  if (activeTab === OperatorTabs.ClaimProof) {
    content = (
      <MultipleOptionContextProvider initialValue={selectedTime}>
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
      </MultipleOptionContextProvider>
    )
  } else {
    const {page, itemsPerPage} = await getPageAndItems(searchParams)
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
        />
      </Suspense>
    )
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
