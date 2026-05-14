'use client'

import React, { useEffect, useState } from 'react'
import GatewaysTable, { columns } from '@/app/components/GatewaysTable/GatewaysTable'
import { LoadingTable } from '@/app/components/LoadingListView'
import { getUseRpcData } from '@/app/utils/metadata'
import { getUrl } from '@/app/components/RawEntity/utils'
import BaseTable from '@/app/components/BaseTable'
import TableDownloadButton from '@/app/components/TableDownloadButton'
import { formatSimpleAmount } from '@/app/utils/format'
import EntityLink from '@/app/components/EntityLink'
import { CircleAlert } from 'lucide-react'
import { indexerMetadataDocument } from '@/app/operations/metadata'
import useFetchOnBlock from '@/app/hooks/useFetchOnBlock'
import { useSearchParams } from 'next/navigation'
import type { ApplicationResponseFromRpc } from '@/app/(details)/app/[id]/getApp'
import { useRpcUrl } from '@/app/context/rpcUrl'

interface DelegatedToTabProps {
  app: string
}

export default function DelegatedToTab({app}: DelegatedToTabProps) {
  const rpcUrl = useRpcUrl()
  const searchParams = useSearchParams()
  const [rpcData, setRpcData] = useState<ApplicationResponseFromRpc['application'] | null>(null)
  const [isLoadingRpc, setIsLoadingRpc] = useState(false)

  const pageParam = searchParams.get('p')
  const itemsParam = searchParams.get('ps')
  const activeFilter = searchParams.get('filter') || undefined

  const page = pageParam ? parseInt(pageParam, 10) : 1
  const itemsPerPage = itemsParam ? parseInt(itemsParam, 10) : 25

  const { data: metadata, isLoading: isLoadingMetadata } = useFetchOnBlock({
    query: indexerMetadataDocument,
    initialResult: null,
    initialError: false
  })

  const useRpcData = metadata ? getUseRpcData(metadata) : false

  useEffect(() => {
    if (useRpcData && !rpcData && !isLoadingRpc) {
      setIsLoadingRpc(true)
      fetch(getUrl(rpcUrl, 'app', app))
        .then(res => {
          if (res.status === 404) {
            return null
          }
          return res.json().then(res => res.application)
        })
        .then(data => {
          setRpcData(data)
          setIsLoadingRpc(false)
        })
        .catch(() => {
          setIsLoadingRpc(false)
        })
    }
  }, [useRpcData, app, rpcData, isLoadingRpc])

  if (isLoadingMetadata || (useRpcData && isLoadingRpc)) {
    return <LoadingTable columns={columns} rowsAmount={itemsPerPage} />
  }

  if (useRpcData) {
    const rows = rpcData?.delegatee_gateway_addresses?.map(address => ({
      id: address
    })) || []

    const tableColumns = [
      {
        field: 'id',
        headerName: 'Address',
        renderCell: (row: {id: string}) => (
          <div className={'text-xs md:text-sm'}>
            <EntityLink
              entity={'gateway'}
              entityId={row.id}
              label={row.id}
            />
          </div>
        )
      },
    ]

    return (
      <div className={"w-full h-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
        <div className={"flex pt-4 px-3 md:px-4 pb-3 flex-row w-full min-h-[74px] flex-wrap items-center justify-between gap-3"}>
          <p className={"text-sm"}>
            {formatSimpleAmount(rpcData?.delegatee_gateway_addresses?.length || 0)} gateway{rpcData?.delegatee_gateway_addresses?.length === 1 ? '' : 's'} found
          </p>
          {rows.length > 0 && (
            <TableDownloadButton rows={rows} columns={tableColumns.map((col) => ({...col, renderCell: undefined}))} />
          )}
        </div>
        <BaseTable
          rows={rows}
          columns={tableColumns}
        />
        {!rpcData?.delegatee_gateway_addresses?.length && (
          <div className={"h-[400px] flex flex-col items-center justify-center"}>
            <CircleAlert className={"h-16 w-16 text-[color:--warning]"}/>
            <p className={"text-lg font-semibold mt-4 mb-3"}>
              There are no matching records
            </p>
            <p className={"text-sm text-[color:--secondary]"}>
              Please try another search
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <GatewaysTable
      page={page}
      itemsPerPage={itemsPerPage}
      basePath={`/app/${app}?tab=delegated_to`}
      application={app}
      activeFilter={activeFilter}
    />
  )
}
