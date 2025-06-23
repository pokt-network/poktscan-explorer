import type { Supplier } from '@/app/(details)/supplier/[id]/getSupplier'
import { Item } from '@/app/components/EntityDetail'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'
import EntityLink from '@/app/components/EntityLink'

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
    {
      type: 'row',
      label: 'Balance',
      value: skeleton || values.balance
    }
  ]

  if (!isLoading && values.stakeType === 'Non-Custodian') {
    rows.push({
        type: 'divider'
      }, {
        type: 'row',
        label: 'Owner Address',
        value: (
          <div className={'text-sm'}>
            <EntityLink entity={'account'} entityId={values.ownerAddress} />
          </div>
        ),
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

  if (!isLoading && values?.status !== 'Staked' && values?.unstakingBeginAt) {
    rows.push({
        type: 'divider'
      }, {
        type: 'row',
        label: 'Unstaking Begins At',
        value: (
          <div className={"text-sm"}>
            <EntityLink entity={'block'} entityId={values.unstakingBeginAt} copy={{enabled: true}}/>
          </div>
        )
      }
    )

    if (values.unstakedAt) {
      rows.push({
        type: 'row',
        label: 'Unstaked At',
        value: (
          <div className={"text-sm"}>
            <EntityLink entity={'block'} entityId={values.unstakedAt} copy={{enabled: true}}/>
          </div>
        )
      })
    } else if (values.unstakingEndAt) {
      rows.push({
        type: 'row',
        label: 'Unstaking Ends At',
        value: (
          <div className={"text-sm"}>
            <EntityLink entity={'block'} entityId={values.unstakingEndAt} copy={{enabled: true}}/>
          </div>
        )
      })
    }
  }

  return rows
}
