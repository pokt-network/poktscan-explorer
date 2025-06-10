import type { LabelByIndex } from '@/app/components/FourCards/utils'
import { supplierSummaryDocument } from '@/app/suppliers/operations'
import { getClient } from '@/app/config/apollo/rsc'
import SuppliersTable, { columns } from '@/app/components/SuppliersTable/SuppliersTable'
import ListTitle from '@/app/components/ListTitle'
import Summary from '@/app/suppliers/Summary'
import React, { Suspense } from 'react'
import { getPageAndItems } from '@/app/utils/pagination'
import { LoadingSummary, LoadingTable } from '@/app/components/LoadingListView'

export const dynamic = "force-dynamic";

const summaryLabelsByIndex: LabelByIndex = {
  1: 'Staked Suppliers',
  2: 'Staked Tokens',
  3: 'Unstaking Suppliers',
  4: 'Unstaking Tokens',
}

async function SuppliersSummary() {
  const {data: summaryData} = await getClient().query({
    query: supplierSummaryDocument,
  })

  return (
    <Summary initialData={summaryData} labels={summaryLabelsByIndex} />
  )
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function ServerSuppliersTable({searchParams}: PageProps) {
  const {page, itemsPerPage,} = await getPageAndItems(searchParams)

  return (
    <SuppliersTable page={page} itemsPerPage={itemsPerPage} basePath={'/suppliers'} key={'suppliers'} />
  )
}

export default async function SuppliersPage({searchParams}: PageProps) {
  const pageInfo = await getPageAndItems(searchParams)

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Suppliers'} />
      <Suspense
        key={`suppliers-summary`}
        fallback={
          <LoadingSummary
            labels= {summaryLabelsByIndex}
          />
        }
      >
        <SuppliersSummary />
      </Suspense>
      <Suspense
        key={`suppliers-page-${pageInfo.page}-${pageInfo.itemsPerPage}`}
        fallback={
          <LoadingTable
            columns={columns}
            rowsAmount={pageInfo.itemsPerPage}
          />
        }
      >
        <ServerSuppliersTable searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
