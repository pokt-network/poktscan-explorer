import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import Table, { GridColDef } from '@/app/components/Table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CircleHelp } from 'lucide-react'
import DetailCell from '@/app/components/DetailCell'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
import { getStakeLabel } from '@/app/utils/stake'
import { convertUpoktToPokt, formatAmount, truncateAddress } from '@/app/utils/format'
import Chip from '@/app/components/Chip'
import { GatewaysSubscription } from '@/app/components/GatewaysTable/GatewaysSubscription'

const gatewayListDocument = graphql(`
  query gatewayList($limit: Int!, $offset: Int!, $filter: GatewayFilter) {
    gateways(first: $limit, offset: $offset, filter: $filter) {
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
        unstakingBeginBlock {
          height: id
        }
        unstakingEndBlock {
          height: id
        }
        applications: applicationGateways {
          nodes {
            application {
              id
              applicationServices {
                nodes {
                  service {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
    stakedGateways: gateways(filter: {stakeStatus: {equalTo: Staked}}) {
      totalCount
      aggregates {
        sum {
          stakeAmount
        }
      }
    }
  }
`)

interface RowGateway {
  id: string
  status: string
  stakeAmount: string
  balance: string
  applicationsDelegating: Array<string>
  services: Array<string>
  servicesData: Array<{ id: string, name: string }>
  allApplications: Array<string>
}

interface PageProps {
  page: number
  itemsPerPage: number
  basePath: string
  service?: string
}

export default async function GatewaysTable({page, itemsPerPage, basePath, service}: PageProps) {
  const filter = service ? {
    applicationGateways: {
      some: {
        application: {
          applicationServices: {
            some: {
              serviceId: {
                equalTo: service
              }
            }
          }
        }
      }
    }
  } : undefined

  let {data} = await getClient().query({
    query: gatewayListDocument,
    variables: {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      filter
    }
  })

  const totalPages = Math.ceil((data.gateways?.totalCount || 0) / itemsPerPage)

  if (page > totalPages) {
    page = 1

    const result = await getClient().query({
      query: gatewayListDocument,
      variables: {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        filter
      }
    })

    data = result.data
  }

  const rows: Array<RowGateway> = data.gateways?.nodes?.map((gateway) => {
    const applications: Array<string> = [], services = new Map<string, string>()

    for (const application of gateway.applications.nodes) {
      applications.push(application.application!.id)

      for (const service of application.application!.applicationServices.nodes) {
        if (services.has(service.service!.id)) continue

        services.set(service.service!.id, service.service!.name)
      }
    }

    const balance = gateway.account?.balances?.nodes?.at(0) || {
      amount: '0',
      denom: 'upokt'
    }

    const servicesArray = [], servicesNames = []

    for (const [key, value] of services.entries()) {
      servicesArray.push({
        id: key,
        name: value
      })

      servicesNames.push(value)
    }

    return {
      id: gateway.id,
      status: getStakeLabel(gateway.stakeStatus),
      stakeAmount: formatAmount({
        amount: gateway.stakeAmount,
        denom: gateway.stakeDenom
      }),
      raw_stakeAmount: convertUpoktToPokt(gateway.stakeAmount),
      balance: formatAmount(balance),
      raw_balance: convertUpoktToPokt(balance?.amount),
      applicationsDelegating: applications,
      services: servicesNames,
      servicesData: servicesArray,
      allApplications: applications
    }
  })

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
                  See a preview of the gateway details
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      renderCell: (row: RowGateway) => {
        return (
          <DetailCell
            rows={
              [
                {
                  label: 'Applications',
                  value: row.allApplications.length ?(
                    <ul className={'pt-2 pl-5 list-disc'}>
                      {row.allApplications.map((application) => (
                        <li key={application}>
                          <EntityLink entity={'app'} entityId={application} copy={{enabled: true}}/>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={"text-xs mt-1"}>
                      No Applications
                    </p>
                  )
                },
                {
                  label: 'Services',
                  value: row.servicesData.length ? (
                    <ul className={'pt-2 pl-5 list-disc'}>
                      {row.servicesData.map((service) => (
                        <li key={service!.id}>
                          <p className={"text-xs"}>
                            {service!.name}{service.id !== service.name && ` (${service!.id})`}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={"text-xs mt-1"}>
                      No Services
                    </p>
                  )
                },
              ]}
            entityProps={{
              entity: 'gateway',
              entityId: row.id,
              copy: {
                enabled: false
              }
            }}
          />
        )
      }
    },
    {
      field: 'id',
      headerName: 'Address',
      minWidth: 200,
      renderCell: (row: RowGateway) => (
        <div className={'text-xs md:text-sm'}>
          <EntityLink
            entity={'gateway'}
            entityId={row.id}
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
      align: 'right',
    },
    {
      field: 'balance',
      headerName: 'Balance',
      align: 'right',
    },
    {
      field: 'applicationsDelegating',
      headerName: 'Applications Delegating',
      description: "Applications that this gateways have permissions",
      renderCell: (cell: RowGateway) => (
        cell.applicationsDelegating.length ? <Chip values={cell.applicationsDelegating.map((app, index) => !index ? (
          <div className={'text-[10px] md:text-xs h-[20px] mt-[-4px]'} key={app}>
            <EntityLink
              entity={'app'}
              entityId={app}
              label={truncateAddress(app)}
              copy={{
                enabled: false
              }}
            />
          </div>
        ) : app)} /> : 'None'
      )
    },
    {
      field: 'services',
      headerName: 'Services',
      renderCell: (cell: RowGateway) => (
        cell.services.length ? <Chip values={cell.services} /> : 'None'
      )
    },
  ]

  return (
    <Table
      columns={columns}
      rows={rows}
      header={{
        title: `${data.gateways?.totalCount} gateways found`,
        subtitle: (
          <GatewaysSubscription service={service} />
        )
      }}
      pagination={{
        currentPage: page,
        totalPages,
        itemsPerPage,
        basePath
      }}
      defaultMinWidth={70}
    />
  )
}
