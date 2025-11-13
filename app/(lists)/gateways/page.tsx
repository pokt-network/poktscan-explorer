'use client'

import React, { useMemo } from 'react'
import ListTitle from '@/app/components/ListTitle'
import GatewaysTable from '@/app/components/GatewaysTable/GatewaysTable'
import { useSearchParams } from 'next/navigation'

export default function GatewaysPage() {
  const searchParams = useSearchParams()

  const { page, itemsPerPage, activeFilter } = useMemo(() => {
    const pageParam = searchParams.get('p')
    const itemsParam = searchParams.get('ps')
    const filterParam = searchParams.get('filter')

    const page = pageParam ? parseInt(pageParam, 10) : 1
    const itemsPerPage = itemsParam ? parseInt(itemsParam, 10) : 50
    const activeFilter = typeof filterParam === 'string' ? filterParam : undefined

    return { page, itemsPerPage, activeFilter }
  }, [searchParams])

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Gateways'} />
      <GatewaysTable
        page={page}
        itemsPerPage={itemsPerPage}
        basePath={'/gateways'}
        activeFilter={activeFilter}
      />
    </div>
  )
}
