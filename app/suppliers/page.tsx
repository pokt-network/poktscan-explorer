import { supplierSummaryDocument } from '@/app/suppliers/operations'
import { getClient } from '@/app/config/apollo/rsc'
import SuppliersTable from '@/app/components/SuppliersTable/SuppliersTable'
import ListTitle from '@/app/components/ListTitle'
import Summary from '@/app/suppliers/Summary'
import React from 'react'
import { getPageAndItems } from '@/app/utils/pagination'

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SuppliersPage({searchParams}: PageProps) {
  const client = getClient()

  const {page, itemsPerPage,} = await getPageAndItems(searchParams)
  const [suppliersTable, {data: summaryData}] = await Promise.all([
    <SuppliersTable page={page} itemsPerPage={itemsPerPage} basePath={'/suppliers'} key={'suppliers'} />,
    client.query({
      query: supplierSummaryDocument,
    })
  ])

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Suppliers'} />
      <Summary initialData={summaryData} />
      {suppliersTable}
    </div>
  )
}
