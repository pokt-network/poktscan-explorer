import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'
import { formatTimeDifference } from '@/app/(home)/utils'
import { formatSimpleAmount, formatSize, formatUpokt } from '@/app/utils/format'
import { BlockResponse } from '@/app/(details)/block/[id]/getBlock'
import { Item } from '@/app/components/EntityDetail'

export function getRows(block: BlockResponse | null, isLoading = false): Array<Item> {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  if (!isLoading && !block?.took) {
    return [
      {
        type: 'row',
        label: <DateColumn />,
        value: skeleton || (
          <div className={"text-sm"}>
            <DateCellText value={block!.timestamp} />
          </div>
        )
      },
      {
        type: 'row',
        label: 'Transactions',
        value: skeleton || formatSimpleAmount(block!.transactions)
      },
      {
        type: 'row',
        label: 'Proposer',
        value: skeleton || block!.proposerAddress
      },
    ]
  }

  return [
    {
      type: 'row',
      label: <DateColumn />,
      value: skeleton || (
        <div className={"text-sm"}>
          <DateCellText value={block!.timestamp} />
        </div>
      )
    },
    {
      type: 'row',
      label: 'Took',
      value: skeleton || formatTimeDifference(block!.took!)
    },
    {
      type: 'row',
      label: 'Transactions',
      value: skeleton || formatSimpleAmount(block!.transactions)
    },
    {
      type: 'row',
      label: 'Proposer',
      value: skeleton || block!.proposerAddress
    },
    {
      type: 'row',
      label: 'Size',
      value: skeleton || formatSize(block!.size!)
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Total Supply',
      value: skeleton || formatUpokt({
        amount: block!.totalSupply!
      })
    },
    {
      type: 'row',
      label: 'Apps Staked Tokens',
      value: skeleton || formatUpokt({
        amount: block!.stakedAppsTokens!
      })
    },
    {
      type: 'row',
      label: 'Apps Staked',
      value: skeleton || formatSimpleAmount(block!.stakedApps!)
    },
    {
      type: 'row',
      label: 'Suppliers Staked Tokens',
      value: skeleton || formatUpokt({
        amount: block!.stakedSuppliersTokens!
      })
    },
    {
      type: 'row',
      label: 'Suppliers Staked',
      value: skeleton || formatSimpleAmount(block!.stakedSuppliers!)
    },
    {
      type: 'row',
      label: 'Gateways Staked Tokens',
      value: skeleton || formatUpokt({
        amount: block!.stakedGatewaysTokens!
      })
    },
    {
      type: 'row',
      label: 'Gateways Staked',
      value: skeleton || formatSimpleAmount(block!.stakedGateways!)
    },
    {
      type: 'row',
      label: 'Relays',
      value: skeleton || formatSimpleAmount(block!.totalRelays!)
    },
    {
      type: 'row',
      label: 'Computed Units',
      value: skeleton || formatSimpleAmount(block!.totalComputedUnits!)
    },
  ]
}
