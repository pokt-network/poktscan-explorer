'use client'

import type { LabelByIndex } from '@/app/components/FourCards/utils'
import SuppliersTable from '@/app/components/SuppliersTable/SuppliersTable'
import ListTitle from '@/app/components/ListTitle'
import Summary from '@/app/(lists)/suppliers/Summary'
import React, { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

const summaryLabelsByIndex: LabelByIndex = {
  1: 'Staked Suppliers',
  2: 'Staked Tokens',
  3: 'Unstaking Suppliers',
  4: 'Unstaking Tokens',
}

export default function SuppliersPage() {
  const searchParams = useSearchParams()

  const { page, itemsPerPage, activeFilter } = useMemo(() => {
    const pageParam = searchParams.get('p')
    const itemsParam = searchParams.get('ps')
    const filterParam = searchParams.get('filter')

    const page = pageParam ? parseInt(pageParam, 10) : 1
    const itemsPerPage = itemsParam ? parseInt(itemsParam, 10) : 25
    const activeFilter = typeof filterParam === 'string' ? filterParam : undefined

    return { page, itemsPerPage, activeFilter }
  }, [searchParams])

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Suppliers'} />
      <Summary
        initialData={null as any}
        initialError={false}
        labels={summaryLabelsByIndex}
      />
      <SuppliersTable
        page={page}
        itemsPerPage={itemsPerPage}
        basePath={'/suppliers'}
        activeFilter={activeFilter}
      />
    </div>
  )
}
