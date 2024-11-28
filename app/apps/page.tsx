import { graphql } from '@/app/config/gql'
import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import {
  ApplicationGateway,
  ApplicationService,
} from '@/app/config/gql/graphql'
import { getStakeLabel } from '@/app/utils/stake'
import Table, { GridColDef } from '@/app/components/Table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CircleHelp } from 'lucide-react'
import DetailCell from '@/app/components/DetailCell'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
import FourCard from '@/app/components/FourCard'
import { formatAmount, truncateAddress } from '@/app/utils/format'
import Chip from '@/app/components/Chip'
import ListTitle from '@/app/components/ListTitle'

export const dynamic = "force-dynamic";

const applicationListDocument = graphql(`
  query applications($limit: Int!, $offset: Int!) {
    applications(first: $limit, offset: $offset) {
      totalCount
      nodes {
        id
        account {
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
        services: applicationServices {
          nodes {
            service {
              id
              name
            }
          }
        }
        applicationGateways {
          nodes {
            gatewayId
          }
        }
        unstakingBeginBlock {
          height
        }
        unstakingEndHeight
        unstakingEndBlock {
          height
        }
        unstakingReason
      }
    }
    stakedApps: applications(filter: {stakeStatus: {equalTo: 0}}) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
    unstakingApps: applications(filter: {stakeStatus: {equalTo: 1}}) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
  }
`)

interface RowApp {
  id: string
  status: string
  stakeAmount: string
  balance: string
  services: Array<string>
  servicesData: Array<ApplicationService>
  gateways: Array<React.ReactNode>
  gatewaysData: Array<ApplicationGateway>
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AppsPage({searchParams}: PageProps) {
  const pageInfo = await getPageAndItems(searchParams)
  let page = pageInfo.page
  const itemsPerPage = pageInfo.itemsPerPage

  let {data} = await getClient().query({
    query: applicationListDocument,
    variables: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage
    }
  })

  const totalPages = Math.ceil((data.applications?.totalCount || 0) / itemsPerPage)

  if (page > totalPages) {
    page = 1

    const result = await getClient().query({
      query: applicationListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      }
    })

    data = result.data
  }

  const rows: Array<RowApp> = data.applications?.nodes?.map((application) => ({
    id: application!.id,
    status: getStakeLabel(application!.stakeStatus),
    stakeAmount: formatAmount({
      amount: application!.stakeAmount,
      denom: application!.stakeDenom
    }),
    balance: formatAmount(application.account?.balances?.nodes?.at(0) || {
      amount: '0',
      denom: 'upokt'
    }),
    services: application!.services.nodes.map(service => service.service!.name),
    servicesData: application!.services!.nodes!,
    gateways: application!.applicationGateways.nodes.map((gateway, index) => !index ? (
      <div className={'text-[10px] md:text-xs h-[20px] mt-[-4px]'} key={gateway!.gatewayId}>
        <EntityLink
          entity={'gateway'}
          entityId={gateway!.gatewayId}
          label={truncateAddress(gateway!.gatewayId)}
          copy={{
            enabled: false
          }}
        />
      </div>
    ) : gateway.gatewayId),
    gatewaysData: application!.applicationGateways!.nodes!
  }))


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
                  See preview of the application details
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      renderCell: (cell: RowApp) => {
        return (
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
                ...cell.gatewaysData.length > 0 ? [
                  {
                    label: 'Gateways',
                    value: (
                      <ul className={'pt-2 pl-5 list-disc'}>
                        {cell.gatewaysData.map((gateway) => (
                          <li key={gateway.gatewayId}>
                            <EntityLink entity={'gateway'} entityId={gateway.gatewayId}/>
                          </li>
                        ))}
                      </ul>
                    )
                  },
                ] : []
              ]}
            entityProps={{
              entity: 'app',
              entityId: cell.id
            }}
          />
        )
      }
    },
    {
      field: 'id',
      headerName: 'Address',
      maxWidth: 250,
      renderCell: (cell: RowApp) => (
        <div className={'text-xs md:text-sm'}>
          <EntityLink
            entity={'app'}
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
      field: 'stakeAmount',
      headerName: 'Stake Amount',
    },
    {
      field: 'balance',
      headerName: 'Balance',
    },
    {
      field: 'services',
      headerName: 'Services',
      renderCell: (cell: RowApp) => (
        <Chip values={cell.services} />
      )
    },
    {
      field: 'gateways',
      headerName: 'Delegated To',
      description: "Gateways that have permissions to send relays on behalf of this application",
      renderCell: (cell: RowApp) => (
        cell.gateways.length ? <Chip values={cell.gateways} /> : 'None'
      )
    }
  ]

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ListTitle title={'Applications'} />
      <FourCard
        items={[
          {
            label: 'Staked Applications',
            children: data.stakedApps?.totalCount
          },
          {
            label: 'Staked Tokens',
            children: formatAmount({
              denom: 'upokt',
              amount: data.stakedApps?.aggregates?.sum?.stakeAmount
            })
          },
          {
            label: 'Unstaking Applications',
            children: data.unstakingApps?.totalCount
          },
          {
            label: 'Unstaking Tokens',
            children: formatAmount({
              denom: 'upokt',
              amount: data.unstakingApps?.aggregates?.sum?.stakeAmount
            })
          },
        ]}
      />
      <Table columns={columns} rows={rows} header={{ title: `${data.applications?.totalCount} applications found` }}
             pagination={{ currentPage: page, totalPages, itemsPerPage, basePath: '/apps' }} />
    </div>
  )
}
