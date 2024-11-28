import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import { getPageAndItems } from '@/app/utils/pagination'
import EntityLink from '@/app/components/EntityLink'
import FourCard from '@/app/components/FourCard'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CircleHelp } from 'lucide-react'
import React from 'react'
import DetailCell from '@/app/components/DetailCell'
import { SupplierServiceConfig } from '@/app/config/gql/graphql'
import { getStakeLabel } from '@/app/utils/stake'
import { formatAmount } from '@/app/utils/format'
import Chip from '@/app/components/Chip'
import ListTitle from '@/app/components/ListTitle'

export const dynamic = "force-dynamic";

const supplierListDocument = graphql(`
  query supplierList($limit: Int!, $offset: Int!) {
    suppliers(first: $limit, offset: $offset) {
      totalCount
      nodes {
        id
        ownerId
        owner {
          id
          balances {
            nodes {
              amount
              denom
            }
          }
        }
        operatorId
        operator {
          id
          balances {
            nodes {
              amount
              denom
            }
          }
        }
        stakeAmount
        stakeDenom
        stakeStatus
        supplierServices: serviceConfigs {
          nodes {
            service {
              id
              name
            }
          }
        }
      }
    }
    stakedSuppliers: suppliers(filter: {stakeStatus: {equalTo: 0}}) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
    unstakingSuppliers: suppliers(filter: {stakeStatus: {equalTo: 1}}) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
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

  let {data} = await getClient().query({
    query: supplierListDocument,
    variables: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage
    }
  })

  const totalPages = Math.ceil((data.suppliers?.totalCount || 0) / itemsPerPage)

  if (page > totalPages) {
    page = 1

    const result = await getClient().query({
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
    return {
      id: supplier!.id,
      status: getStakeLabel(supplier!.stakeStatus),
      stakeType: supplier!.stakeStatus === 0 ? isCustodian ? "Custodian" : "Non-Custodian" : "-",
      stakeAmount: formatAmount({
        amount: supplier!.stakeAmount,
        denom: supplier!.stakeDenom
      }),
      balance: formatAmount(supplier!.operator?.balances?.nodes?.at(0) || {
        amount: 0,
        denom: 'upokt'
      }),
      outputBalance: isCustodian ? '-' : formatAmount(supplier!.owner?.balances?.nodes?.at(0) || {
        amount: 0,
        denom: 'upokt'
      }),
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
      <FourCard
        items={[
          {
            label: 'Staked Suppliers',
            children: data.stakedSuppliers?.totalCount
          },
          {
            label: 'Staked Tokens',
            children: formatAmount({
              denom: 'upokt',
              amount: data.stakedSuppliers?.aggregates?.sum?.stakeAmount
            })
          },
          {
            label: 'Unstaking Suppliers',
            children: data.unstakingSuppliers?.totalCount
          },
          {
            label: 'Unstaking Tokens',
            children: formatAmount({
              denom: 'upokt',
              amount: data.unstakingSuppliers?.aggregates?.sum?.stakeAmount
            })
          },
        ]}
      />
      <Table
        columns={columns}
        rows={rows}
        header={{
          title: `${data.suppliers?.totalCount} suppliers found`,
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
