import React from 'react'
import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import { getStakeLabel } from '@/app/utils/stake'
import EntityLink from '@/app/components/EntityLink'
import { formatAmount } from '@/app/utils/format'
import TitleEntity from '@/app/components/TitleEntity'
import NotFound from '@/app/not-found'

const gatewayByIdDocument = graphql(`
  query gatewayById($id: String!) {
    gateway(id: $id) {
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
        height
      }
      unstakingEndBlock {
        height
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
`)

export default async function GatewayLayout({children, params}: Readonly<{
  children: React.ReactNode;
  params: Promise<{id: string}>
}>) {
  const {id} = await params

  const {data} = await getClient().query({
    query: gatewayByIdDocument,
    variables: {
      id
    }
  })

  if (!data.gateway) {
    return (
      <NotFound />
    )
  }

  const { gateway } = data

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Balance',
      value: formatAmount(gateway.account?.balances?.nodes?.at(0) || {
        amount: '0',
        denom: 'upokt'
      })
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Status',
      value: getStakeLabel(gateway.stakeStatus)
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: formatAmount({
        amount: gateway.stakeAmount,
        denom: gateway.stakeDenom
      })
    },
    {
      type: 'row',
      label: 'Apps with Services',
      description: 'Applications that allows this gateway to send relays on their behalf',
      value: gateway.applications?.nodes?.length ? (
        <ul className={''}>
          {gateway.applications?.nodes.map(({ application }) => (
            <li key={application.id}>
              <div className={"text-sm"}>
                <EntityLink entity={'app'} entityId={application.id}/>
                <ul className={'pt-2 pl-1'}>
                  {application.applicationServices.nodes.map(({ service }) => (
                    <li key={service.id}>
                      <p className={"text-sm"}>
                        - {service.name}{service.id !== service.name && ` (${service.id})`}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      ) : 'None'
    }
  ]

  if (gateway.stakeStatus !== 0) {
    rows.push({
      type: 'divider'
    }, {
      type: 'row',
      label: 'Unstaking Begin At',
      value: gateway.unstakingBeginBlock!.height
    })

    if (gateway.unstakingEndBlock) {
      rows.push({
        type: 'row',
        label: 'Unstaked At Height',
        value: gateway.unstakingEndBlock!.height
      })
    }
  }

  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <TitleEntity title={'Gateway'} text={gateway.id} />
      <EntityDetail
        items={rows}
      />
      {children}
    </div>
  )
}
