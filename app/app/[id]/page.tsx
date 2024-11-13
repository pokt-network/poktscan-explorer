import { graphql } from '@/app/config/gql'
import { getClient } from '@/app/config/apollo/rsc'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import { getStakeLabel } from '@/app/utils/stake'
import { formatBalance } from '@/app/utils/balances'
import EntityLink from '@/app/components/EntityLink'

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
      stake
      status
      unstakedAtBlock {
        height
      }
      unstakingStartBlock {
        height
      }
      unstakingHeight
      services:applicationServices {
        nodes {
          service {
            id
            name
          }
        }
      }
      gateways: applicationDelegatedToGateways {
        nodes {
          gatewayId
        }
      }
      transferToEndedAt {
        height
      }
      transferFromId
      transferredFromAt {
        height
      }
      transferToId
      transferringToId
      transferEndsAtHeight
    }
  }
`)

interface PageProps {
  params: Promise<{id: string}>
}

export default async function AppPage({params}: PageProps) {
  const { id } = await params

  const { data } = await getClient().query({
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
      value: formatBalance(app.account.balances.nodes.at(0)!)
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Status',
      value: getStakeLabel(app.status)
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: formatBalance(app.stake)
    },
    {
      type: 'row',
      label: app.services.nodes.length === 1 ? 'Service' : 'Services',
      value: (
        <ul className={'pt-2 pl-1'}>
          {app.services.nodes.map(({ service }) => (
            <li key={service.id}>
              <p className={"text-sm"}>
                {service.name}{service.id !== service.name && ` (${service.id})`}
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
        <ul className={'pt-2 pl-1'}>
          {app.gateways.nodes.map((gateway) => (
            <li key={gateway.gatewayId}>
              <EntityLink entity={'gateway'} entityId={gateway.gatewayId}/>
            </li>
          ))}
        </ul>
      )
    })
  }


  if (app.status !== 0) {
    rows.push({
        type: 'divider'
      }, {
        type: 'row',
        label: 'Unstaking Begin At',
        value: app.unstakingStartBlock!.height
      },
      {
        type: 'row',
        label: 'Unstaking End At',
        value: app.unstakingHeight
      })

    if (app.unstakedAtBlock) {
      rows.push({
        type: 'row',
        label: 'Unstaked At Height',
        value: app.unstakedAtBlock!.height
      })
    }
  } else {
    if (app.transferFromId) {
      rows.push({
        type: 'row',
        label: 'Transferred From',
        value: (
          <EntityLink entity={'app'} entityId={app.transferFromId} copy={{enabled: true}}/>
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
          <EntityLink entity={'block'} entityId={app.transferEndsAtHeight} copy={{enabled: true}}/>
        )
      })
    }

    if (app.transferToId) {
      rows.push({
        type: 'row',
        label: 'Transferred To',
        value: (
          <EntityLink entity={'app'} entityId={app.transferToId} copy={{enabled: true}}/>
        )
      }, {
        type: 'row',
        label: 'Transferred At',
        value: (
          <EntityLink entity={'block'} entityId={app.transferToEndedAt.height} copy={{enabled: true}}/>
        )
      })
    }
  }


  return (
    <div className={"p-10 gap-5 flex flex-col"}>
      <div className={"flex flex-row items-center gap-3"}>
        <h1 className={'text-2xl font-semibold'}>
          Application
        </h1>
        <p className={'text-lg text-[color:--secondary]'}>
          {app.id}
        </p>
      </div>
      <EntityDetail
        items={rows}
      />
    </div>
  )
}
