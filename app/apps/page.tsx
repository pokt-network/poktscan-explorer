import { graphql } from '@/app/config/gql'
import { getPageAndItems } from '@/app/utils/pagination'
import { getClient } from '@/app/config/apollo/rsc'
import { ApplicationDelegatedToGateway, ApplicationService, SupplierService } from '@/app/config/gql/graphql'
import { getStakeLabel } from '@/app/utils/stake'
import { formatBalance } from '@/app/utils/balances'
import Table, { GridColDef } from '@/app/components/Table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CircleHelp } from 'lucide-react'
import DetailCell from '@/app/components/DetailCell'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
import FourCard from '@/app/components/FourCard'

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
        stake
        status
        services: applicationServices {
          nodes {
            service {
              id
              name
            }
          }
        }
        applicationDelegatedToGateways {
          nodes {
            gatewayId
          }
        }
        unstakingStartBlock {
          height
        }
        unstakingHeight
        unstakedAtBlock {
          height
        }
        unstakingReason
        unstakedAtBlock {
          height
        }
      }
    }
    stakedApps: applications(filter: {status: {equalTo: 0}}) {
      totalCount
      aggregates {
        sum {
          # TODO: replace this when stake is not a coin JSON scalar field but a value we can aggregate
          status
        }
      }
    }
    unstakingApps: applications(filter: {status: {equalTo: 1}}) {
      totalCount
      aggregates {
        sum {
          # TODO: replace this when stake is not a coin JSON scalar field but a value we can aggregate
          status
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
  services: string
  servicesData: Array<ApplicationService>
  gateways: string
  gatewaysData: Array<ApplicationDelegatedToGateway>
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AppsPage({searchParams}: PageProps) {
  let {page, itemsPerPage} = await getPageAndItems(searchParams)

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
    status: getStakeLabel(application!.status),
    stakeAmount: formatBalance(application!.stake),
    balance: formatBalance(application!.account!.balances.nodes.at(0)!),
    services: application!.services.nodes.length === 1 ? application!.services.nodes.at(0)!.service!.name : application!.services.nodes.length,
    servicesData: application!.services!.nodes!,
    gateways: !application!.applicationDelegatedToGateways.nodes.length ? '-' : application!.applicationDelegatedToGateways.nodes.length === 1 ? application!.applicationDelegatedToGateways.nodes.at(0)!.gatewayId : `${application!.applicationDelegatedToGateways.nodes.length} Gateways`,
    gatewaysData: application!.applicationDelegatedToGateways!.nodes!
  }))


  const columns: Array<GridColDef> = [
    {
      field: 'detail',
      minWidth: 50,
      maxWidth: 50,
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
      minWidth: 200,
      renderCell: (cell: RowApp) => (
        <EntityLink
          entity={'app'}
          entityId={cell.id}
        />
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
    },
    {
      field: 'gateways',
      headerName: 'Delegated To',
      description: "Gateways that have permissions to send relays on behalf of this application"
    }
  ]

  return (
    <div className={"p-10 gap-5 flex flex-col"}>
      <h1 className={'text-2xl font-semibold'}>
        Applications
      </h1>
      <FourCard
        items={[
          {
            label: 'Staked Applications',
            children: data.stakedApps?.totalCount
          },
          {
            label: 'Staked Tokens',
            children: formatBalance({
              denom: 'upokt',
              amount: data.stakedApps?.aggregates?.sum?.status
            })
          },
          {
            label: 'Unstaking Applications',
            children: data.stakedApps?.aggregates?.sum?.status
          },
          {
            label: 'Unstaking Tokens',
            children: formatBalance({
              denom: 'upokt',
              amount: data.stakedApps?.aggregates?.sum?.status
            })
          },
        ]}
      />
      <Table columns={columns} rows={rows} header={{title: 'Applications', subtitle: 'Apps'}} pagination={{currentPage: page, totalPages, itemsPerPage, basePath: '/apps'}} />
    </div>
  )
}
