'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { gatewayByIdDocument } from '@/app/gateway/[id]/operations'
import React, { useMemo } from 'react'
import NotFound from '@/app/not-found'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import { formatAmount } from '@/app/utils/format'
import { getStakeLabel } from '@/app/utils/stake'
import EntityLink from '@/app/components/EntityLink'
import TitleEntity from '@/app/components/TitleEntity'
import { StakeStatus } from '@/app/config/gql/graphql'

interface GatewayDetailProps {
  initialData: DocumentNodeData<typeof gatewayByIdDocument>
  id: string
  page: React.ReactNode
}

export default function GatewayDetail({id, page, initialData}: GatewayDetailProps) {
  const variables = useMemo(() => ({id}), [id])
  const data = useFetchOnBlock({
    query: gatewayByIdDocument,
    variables,
    initialResult: initialData
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

  if (gateway.stakeStatus !== StakeStatus.Staked) {
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
      {page}
    </div>
  )
}
