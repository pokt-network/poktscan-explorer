import React, { Suspense } from 'react'
import GatewaysTable, { columns } from '@/app/components/GatewaysTable/GatewaysTable'
import { getPageAndItems } from '@/app/utils/pagination'
import { PageProps } from '@/app/types/pages'
import { LoadingTable } from '@/app/components/LoadingListView'
import getMetadata from '@/app/api/metadata'
import { getUseRpcData } from '@/app/utils/metadata'
import { getRawAppFromRpc } from '@/app/(details)/app/[id]/getApp'
import BaseTable from '@/app/components/BaseTable'
import TableDownloadButton from '@/app/components/TableDownloadButton'
import { formatSimpleAmount } from '@/app/utils/format'
import EntityLink from '@/app/components/EntityLink'
import { CircleAlert } from 'lucide-react'

const rpcUrl = process.env.RPC_BASE_URL!

interface DelegatedToTabProps extends PageProps {
  app: string
}

async function ServerDelegatedTo({searchParams, app}: DelegatedToTabProps) {
  const metadata = await getMetadata()

  if (getUseRpcData(metadata)) {
    const application = await getRawAppFromRpc(app, rpcUrl)

    const rows = application?.delegatee_gateway_addresses?.map(address => ({
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
            {formatSimpleAmount(application?.delegatee_gateway_addresses?.length || 0)} gateway{application?.delegatee_gateway_addresses?.length === 1 ? '' : 's'} found
          </p>
          {rows.length > 0 && (
            <TableDownloadButton rows={rows} columns={tableColumns.map((col) => ({...col, renderCell: undefined}))} />
          )}
        </div>
        <BaseTable
          rows={rows}
          columns={tableColumns}
        />
        {!application?.delegatee_gateway_addresses?.length && (
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
  } else {
    const pageInfo = await getPageAndItems(searchParams)

    return (
      <GatewaysTable page={pageInfo.page} itemsPerPage={pageInfo.itemsPerPage} basePath={`/app/${app}?tab=delegated_to`} application={app} />
    )
  }
}

export default async function DelegatedToTab({searchParams, app}: DelegatedToTabProps) {
  return (
    <Suspense
      key={`${app}-${new Date().toISOString()}`}
      fallback={
        <LoadingTable columns={columns} rowsAmount={25} />
      }
    >
      <ServerDelegatedTo searchParams={searchParams} app={app} />
    </Suspense>
  )
}
