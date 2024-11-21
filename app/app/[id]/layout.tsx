import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import React from 'react'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import { formatBalance } from '@/app/utils/balances'
import { getStakeLabel } from '@/app/utils/stake'
import EntityLink from '@/app/components/EntityLink'
import TextWithCopyButton from '@/app/components/TextWithCopyButton'

const appByIdDocument = graphql(`
  query appById($id: String!) {
    application(id: $id) {
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
      unstakingEndBlock {
        height
      }
      unstakingBeginBlock {
        height
      }
      unstakingEndHeight
      services:applicationServices {
        nodes {
          service {
            id
            name
          }
        }
      }
      gateways: applicationGateways {
        nodes {
          gatewayId
        }
      }
      transferEndBlock {
        height
      }
      sourceApplicationId
      transferredFromAt {
        height
      }
      destinationApplicationId
      transferringToId
      transferEndHeight
    }
  }
`)

export default async function AppLayout({children, params}: {
  children: React.ReactNode
  params: Promise<{id: string}>
}) {
  const {id} = await params

  const {data} = await getClient().query({
    query: appByIdDocument,
    variables: {
      id
    }
  })

  if (!data.application) {
    return (
      <div>not found</div>
    )
  }

  const app = data.application

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Balance',
      value: formatBalance(app?.account?.balances?.nodes?.at(0) || {
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
      value: getStakeLabel(app.stakeStatus)
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: formatBalance({
        amount: app.stakeAmount,
        denom: app.stakeDenom
      })
    },
    {
      type: 'row',
      label: app.services.nodes.length === 1 ? 'Service' : 'Services',
      value: (
        <ul>
          {app?.services?.nodes?.map((s) => (
            <li key={s?.service?.id}>
              <p className={"text-sm"}>
                {s?.service?.name}{s?.service?.id !== s?.service?.name && ` (${s?.service?.id})`}
              </p>
            </li>
          ))}
        </ul>
      )
    },
  ]

  if (app.gateways.nodes.length) {
    rows.push({
      type: 'row',
      label: 'Delegated To',
      value: (
        <ul>
          {app?.gateways?.nodes?.map((gateway) => (
            <li key={gateway?.gatewayId} className={'text-sm mt-[-12px]'}>
              <EntityLink entity={'gateway'} entityId={gateway?.gatewayId || ''}/>
            </li>
          ))}
        </ul>
      )
    })
  }


  if (app.stakeStatus !== 0) {
    rows.push({
        type: 'divider'
      }, {
        type: 'row',
        label: 'Unstaking Begin At',
        value: app.unstakingBeginBlock!.height
      },
      {
        type: 'row',
        label: 'Unstaking End At',
        value: app.unstakingEndHeight
      })

    if (app.unstakingEndBlock) {
      rows.push({
        type: 'row',
        label: 'Unstaked At Height',
        value: app.unstakingEndBlock!.height
      })
    }
  }

  if (app.sourceApplicationId) {
    rows.push({
      type: 'row',
      label: 'Transferred From',
      value: (
        <EntityLink entity={'app'} entityId={app.sourceApplicationId} copy={{enabled: true}}/>
      )
    }, {
      type: 'row',
      label: 'Transferred At',
      value: (
        <EntityLink entity={'block'} entityId={app.transferredFromAt!.height} copy={{enabled: true}}/>
      )
    })
  }

  if (app.transferringToId) {
    rows.push({
      type: 'row',
      label: 'Transferring To',
      value: (
        <EntityLink entity={'account'} entityId={app.transferringToId} copy={{enabled: true}}/>
      )
    }, {
      type: 'row',
      label: 'Transfer Ends At',
      value: (
        <EntityLink entity={'block'} entityId={app.transferEndHeight} copy={{enabled: true}}/>
      )
    })
  }

  if (app.destinationApplicationId) {
    rows.push({
      type: 'row',
      label: 'Transferred To',
      value: (
        <EntityLink entity={'app'} entityId={app.destinationApplicationId} copy={{enabled: true}}/>
      )
    }, {
      type: 'row',
      label: 'Transferred At',
      value: (
        <EntityLink entity={'block'} entityId={app.transferEndBlock.height} copy={{enabled: true}}/>
      )
    })
  }

  return (
    <div className={"px-3 py-10 md:px-10 gap-5 flex flex-col"}>
      <div className={"flex flex-row items-center gap-3"}>
        <h1 className={'text-2xl font-semibold'}>
          Application
        </h1>
        <TextWithCopyButton text={app.id} />
      </div>
      <EntityDetail
        items={rows}
      />
      {children}
    </div>
  )
}
