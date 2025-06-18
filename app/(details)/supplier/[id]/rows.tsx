import type { Supplier } from '@/app/(details)/supplier/[id]/getSupplier'
import { Item } from '@/app/components/EntityDetail'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function getRows(values: Supplier | null,
  isLoading = false
) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Status',
      value: skeleton || values.status
    },
    {
      type: 'row',
      label: 'Stake Type',
      value: skeleton || values.stakeType
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: skeleton || values.stakeAmount
    },
  ]

  if (!isLoading && values.stakeType === 'Non-Custodian') {
    rows.push({
      type: 'divider'
    }, {
      type: 'row',
      label: 'Operator Address',
      value: values.operatorAddress,
    })
  }

  rows.push({
    type: 'row',
    label: 'Balance',
    value: skeleton || values.balance
  })

  if (!isLoading && values.stakeType === 'Non-Custodian') {
    rows.push({
        type: 'divider'
      }, {
        type: 'row',
        label: 'Owner Address',
        value: values.ownerAddress,
      },
    )

    if (values?.ownerBalance) {
      rows.push({
        type: 'row',
        label: 'Owner Balance',
        value: values.ownerBalance
      })
    }
  }

  if (!isLoading && values.status !== 'Staked' && values?.unstakingBeginAt) {
    rows.push({
        type: 'divider'
      }, {
        type: 'row',
        label: 'Unstaking Begin At',
        value: values.unstakingBeginAt
      },
      {
        type: 'row',
        label: 'Unstaking End At',
        value: values.unstakingEndAt
      })

    if (values.unstakedAt) {
      rows.push({
        type: 'row',
        label: 'Unstaked At Height',
        value: values.unstakedAt
      })
    }
  }

  return rows
}
