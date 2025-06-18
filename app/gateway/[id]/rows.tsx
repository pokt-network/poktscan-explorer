import type { Item } from '@/app/components/EntityDetail'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatAmount } from '@/app/utils/format'
import { getStakeLabel } from '@/app/utils/stake'
import EntityLink from '@/app/components/EntityLink'
import { StakeStatus } from '@/app/config/gql/graphql'

export default function getRows(gateway, isLoading = false) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Balance',
      value: skeleton || formatAmount(gateway.account?.balances?.nodes?.at(0) || {
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
      value: skeleton || getStakeLabel(gateway.stakeStatus)
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: skeleton || formatAmount({
        amount: gateway.stakeAmount,
        denom: gateway.stakeDenom
      })
    },
    {
      type: 'row',
      label: 'Apps with Services',
      description: 'Applications that allows this gateway to send relays on their behalf',
      value: skeleton ? skeleton : gateway.applications?.nodes?.length ? (
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

  if (!isLoading && gateway.stakeStatus !== StakeStatus.Staked) {
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

  return rows
}
