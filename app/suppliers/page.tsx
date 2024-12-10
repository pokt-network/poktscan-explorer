import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import { getPageAndItems } from '@/app/utils/pagination'
import EntityLink from '@/app/components/EntityLink'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CircleHelp } from 'lucide-react'
import React from 'react'
import DetailCell from '@/app/components/DetailCell'
import { SupplierServiceConfig } from '@/app/config/gql/graphql'
import { getStakeLabel } from '@/app/utils/stake'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import Chip from '@/app/components/Chip'
import ListTitle from '@/app/components/ListTitle'
import { supplierListDocument, supplierSummaryDocument } from '@/app/suppliers/operations'
import Summary from '@/app/suppliers/Summary'
import { graphql } from '@/app/config/gql'
import NewEntitiesFound from '@/app/components/NewEntitiesFound'

export const dynamic = "force-dynamic";

const supplierSubscription = graphql(`
  subscription suppliers {
    suppliers {
      id
    }
  }
`)

interface RowSupplier {
  id: string
  status: string
  stakeType: string
  stakeAmount: string
  balance: string
  outputAddress: string
  outputBalance: string
  services: Array<string>
  servicesData: Array<SupplierServiceConfig>
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SuppliersPage({searchParams}: PageProps) {
  const pageInfo = await getPageAndItems(searchParams)
  let page = pageInfo.page
  const itemsPerPage = pageInfo.itemsPerPage

  const client = getClient()

  // eslint-disable-next-line prefer-const
  let [{data}, {data: summaryData}] = await Promise.all([
    client.query({
      query: supplierListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      }
    }),
    client.query({
      query: supplierSummaryDocument,
    })
  ])

  const totalPages = Math.ceil((data.suppliers?.totalCount || 0) / itemsPerPage)

  if (page > totalPages) {
    page = 1

    const result = await client.query({
      query: supplierListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      }
    })

    data = result.data
  }

  const rows: Array<RowSupplier> = data.suppliers?.nodes?.map((supplier) => {
    const isCustodian = supplier!.stakeStatus === 0 && supplier!.operatorId === supplier!.ownerId
    const balance =supplier!.operator?.balances?.nodes?.at(0) || {
      amount: 0,
      denom: 'upokt'
    }
    const outputBalance = supplier!.owner?.balances?.nodes?.at(0) || {
      amount: 0,
      denom: 'upokt'
    }
    return {
      id: supplier!.id,
      status: getStakeLabel(supplier!.stakeStatus),
      stakeType: supplier!.stakeStatus === 0 ? isCustodian ? "Custodian" : "Non-Custodian" : "-",
      stakeAmount: formatAmount({
        amount: supplier!.stakeAmount,
        denom: supplier!.stakeDenom
      }),
      raw_stakeAmount: convertUpoktToPokt(supplier!.stakeAmount),
      balance: formatAmount(balance),
      raw_balance: convertUpoktToPokt(balance?.amount),
      outputBalance: isCustodian ? '-' : formatAmount(outputBalance),
      raw_outputBalance: isCustodian ? '' : formatAmount(outputBalance),
      outputAddress: isCustodian ? '-' : supplier!.ownerId,
      services: supplier!.supplierServices.nodes.map(service => service!.service!.name),
      servicesData: supplier!.supplierServices!.nodes!
    }
  })

  // TODO: make detail cell a component
  const columns: Array<GridColDef> = [
    {
      field: 'detail',
      minWidth: 60,
      maxWidth: 60,
      headerName: (
        <div className={'w-full h-full flex items-center justify-center'}>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger>
                <CircleHelp className={"w-4 h-4 text-[color:--secondary]"} />
              </TooltipTrigger>
              <TooltipContent side={"left"}>
                <p className={"p-2 bg-[color:--main-background] rounded-lg border border-[color:--divider]"}>
                  See preview of the supplier details
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      renderCell: (cell: RowSupplier) => (
        <DetailCell
          rows={
          [
            {
              label: 'Services',
              value: (
                <ul className={'pt-2 pl-5 list-disc'}>
                  {cell.servicesData.map((service) => (
                    <li key={service.service!.id}>
                      <p className={"text-xs"}>
                        {service.service!.name}
                      </p>
                    </li>
                  ))}
                </ul>
              )
            },
          ]}
          entityProps={{
            entity: 'supplier',
            entityId: cell.id
          }}
        />
      )
    },
    {
      field: 'id',
      headerName: 'Address',
      minWidth: 200,
      renderCell: (cell: RowSupplier) => (
        <div className={'text-xs md:text-sm'}>
          <EntityLink
            entity={'supplier'}
            entityId={cell.id}
          />
        </div>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
    },
    {
      field: 'stakeType',
      headerName: 'Stake Type',
    },
    {
      field: 'stakeAmount',
      headerName: 'Stake Amount',
      align: 'right',
    },
    {
      field: 'balance',
      headerName: 'Balance',
      align: 'right',
    },
    {
      field: "outputAddress",
      headerName: "Output Address",
      renderCell: (cell: RowSupplier) => cell.outputAddress === '-' ? '-' : (
        <div className={'text-xs md:text-sm'}>
          <EntityLink
            entity={'supplier'}
            entityId={cell.outputAddress}
          />
        </div>
      )
    },
    {
      field: 'outputBalance',
      headerName: 'Output Balance',
      align: 'right',
    },
    {
      field: 'services',
      headerName: 'Services',
      renderCell: (cell: RowSupplier) => (
        <Chip values={cell.services} />
      )
    }
  ]

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Suppliers'} />
      <Summary initialData={summaryData} />
      <Table
        columns={columns}
        rows={rows}
        header={{
          title: `${data.suppliers?.totalCount} suppliers found`,
          subtitle: (
            <NewEntitiesFound<typeof supplierSubscription>
              subscription={supplierSubscription}
              entity={'suppliers'}
            />
          )
        }}
        pagination={{
          currentPage: page,
          totalPages,
          itemsPerPage,
          basePath: '/suppliers',
        }}
        defaultMinWidth={70}
      />
    </div>
  )
}
