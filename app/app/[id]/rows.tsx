import { Item } from '@/app/components/EntityDetail'
import { formatAmount } from '@/app/utils/format'
import { getStakeLabel } from '@/app/utils/stake'
import EntityLink from '@/app/components/EntityLink'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { StakeStatus } from '@/app/config/gql/graphql'

export default function getRows(app, isLoading = false) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Balance',
      value: skeleton || formatAmount(app?.account?.balances?.nodes?.at(0) || {
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
      value: skeleton || getStakeLabel(app.stakeStatus)
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: skeleton || formatAmount({
        amount: app.stakeAmount,
        denom: app.stakeDenom
      })
    },
    {
      type: 'row',
      label: !app ? 'Services' : app.services.nodes.length === 1 ? 'Service' : 'Services',
      value: skeleton || (
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

  if (!isLoading && app.gateways.nodes.length) {
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


  if (!isLoading && app.stakeStatus !== StakeStatus.Staked) {
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

  if (!isLoading && app.sourceApplicationId) {
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

  if (!isLoading && app.transferringToId) {
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

  if (!isLoading && app.destinationApplicationId) {
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

  return rows
}
