'use client'

import React, { useMemo } from 'react'
import ListTitle from '@/app/components/ListTitle'
import Summary from '@/app/(lists)/apps/Summary'
import AppsTable from '@/app/components/AppsTable/AppsTable'
import { LabelByIndex } from '@/app/components/FourCards/utils'
import { useSearchParams } from 'next/navigation'

const summaryLabels: LabelByIndex = {
  1: 'Staked Applications',
  2: 'Staked Tokens',
  3: 'Unstaking Applications',
  4: 'Unstaking Tokens',
}

export default function AppsPage() {
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
      <ListTitle title={'Applications'} />
      <Summary
        initialData={null as any}
        initialError={false}
        labels={summaryLabels}
      />
      <AppsTable
        page={page}
        itemsPerPage={itemsPerPage}
        basePath={'/apps'}
        activeFilter={activeFilter}
      />
    </div>
  )
}
