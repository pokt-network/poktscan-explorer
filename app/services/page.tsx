import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import EntityLink from '@/app/components/EntityLink'
import ListTitle from '@/app/components/ListTitle'
import NewEntitiesFound from '@/app/components/NewEntitiesFound'
import React from 'react'
import { serviceListDocument, servicesSubscription } from '@/app/services/operations'
import { formatSimpleAmount } from '@/app/utils/format'

interface RowService {
  id: string
  name: string
  computeUnitsPerRelay: string
  relayMiningDifficulty: string
  apps: number
  suppliers: number
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ServicesPage({searchParams}: PageProps) {
  const pageInfo = await getPageAndItems(searchParams)
  let page = pageInfo.page
  const itemsPerPage = pageInfo.itemsPerPage

  let {data} = await getClient().query({
    query: serviceListDocument,
    variables: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage
    }
  })

  const totalPages = Math.ceil((data.services?.totalCount || 0) / itemsPerPage)

  if (page > totalPages) {
    page = 1

    const result = await getClient().query({
      query: serviceListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      }
    })

    data = result.data
  }

  const rows: Array<RowService> = data.services?.nodes?.map((service) => {
    return {
      id: service?.id,
      name: service?.name,
      computeUnitsPerRelay: formatSimpleAmount(service?.computeUnitsPerRelay),
      apps: service?.apps?.totalCount || 0,
      suppliers: service?.suppliers?.totalCount || 0,
      relayMiningDifficulty: service?.newNumRelaysEma ? formatSimpleAmount(service?.newNumRelaysEma) : '-'
    }
  })

  const columns: Array<GridColDef> = [
    {
      field: 'id',
      headerName: 'ID',
      minWidth: 200,
      renderCell: (row: RowService) => (
        <div className={'text-xs md:text-sm'}>
          <EntityLink
            entity={'service'}
            entityId={row.id}
          />
        </div>
      )
    },
    {
      field: 'name',
      headerName: 'Label',
    },
    {
      field: 'computeUnitsPerRelay',
      headerName: 'Compute Units Per Relay',
      align: 'right'
    },
    {
      field: 'relayMiningDifficulty',
      headerName: 'Relay Mining Difficulty',
      align: 'right'
    },
    {
      field: 'apps',
      headerName: 'Applications',
      align: 'right'
    },
    {
      field: 'suppliers',
      headerName: 'Suppliers',
      align: 'right'
    }
  ]

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Services'} />
      <Table
        columns={columns}
        rows={rows}
        header={{
          title: `${data.services?.totalCount} services found`,
          subtitle: (
            <NewEntitiesFound<typeof servicesSubscription>
              subscription={servicesSubscription}
              entity={'services'}
            />
          )
        }}
        pagination={{
          currentPage: page,
          totalPages,
          itemsPerPage,
          basePath: '/services'
        }}
        defaultMinWidth={70}
      />
    </div>
  )
}
