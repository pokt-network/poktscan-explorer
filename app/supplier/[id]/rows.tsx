import { getStakeLabel, getStakeType } from '@/app/utils/stake'
import { Item } from '@/app/components/EntityDetail'
import { formatAmount } from '@/app/utils/format'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'
import { StakeStatus } from '@/app/config/gql/graphql'

export default function getRows(supplier, isLoading = false) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  const stakeType = isLoading ? '-' : getStakeType(supplier.stakeStatus, supplier.id, supplier.owner?.id)
  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Status',
      value: skeleton || getStakeLabel(supplier.stakeStatus)
    },
    {
      type: 'row',
      label: 'Stake Type',
      value: skeleton || stakeType
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: skeleton || formatAmount({
        amount: supplier.stakeAmount,
        denom: supplier.stakeDenom
      })
    },
  ]

  if (!isLoading && stakeType === 'Non-Custodian') {
    rows.push({
      type: 'divider'
    }, {
      type: 'row',
      label: 'Operator Address',
      value: supplier.id,
    })
  }

  rows.push({
    type: 'row',
    label: 'Balance',
    value: skeleton || formatAmount(supplier.operator?.balances?.nodes?.at(0) || {
      amount: '0',
      denom: 'upokt'
    })
  })

  if (!isLoading && stakeType === 'Non-Custodian') {
    rows.push({
        type: 'divider'
      }, {
        type: 'row',
        label: 'Owner Address',
        value: supplier.owner!.id,
      },
      {
        type: 'row',
        label: 'Owner Balance',
        value: formatAmount(supplier.owner?.balances?.nodes?.at(0) || {
          amount: '0',
          denom: 'upokt'
        })
      })
  }

  if (!isLoading && supplier.stakeStatus !== StakeStatus.Staked) {
    rows.push({
        type: 'divider'
      }, {
        type: 'row',
        label: 'Unstaking Begin At',
        value: supplier.unstakingBeginBlock!.height
      },
      {
        type: 'row',
        label: 'Unstaking End At',
        value: supplier.unstakingEndHeight
      })

    if (supplier.unstakingEndBlock) {
      rows.push({
        type: 'row',
        label: 'Unstaked At Height',
        value: supplier.unstakingEndBlock!.height
      })
    }
  }

  return rows
}
