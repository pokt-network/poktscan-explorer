import { Item } from '@/app/components/EntityDetail'
import { getStakeLabel } from '@/app/utils/stake'
import { formatAmount } from '@/app/utils/format'
import EntityLink from '@/app/components/EntityLink'
import Link from 'next/link'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function getRows(validator, isLoading = false) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Status',
      value: skeleton || getStakeLabel(validator.stakeStatus),
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: skeleton || formatAmount({
        amount: validator.stakeAmount,
        denom: validator.stakeDenom,
      }),
    },
    {
      type: 'divider',
    },
    {
      type: 'row',
      label: 'Signer',
      description: 'validator signer',
      value: skeleton || (
        <div className={'text-sm'}>
          <EntityLink
            entity={'account'}
            entityId={validator?.signer?.id as string}
            copy={{
              enabled: true,
            }}
          />
        </div>
      ),
    },
    {
      type: 'row',
      label: 'Balance',
      value: skeleton || formatAmount(validator.signer?.balances?.nodes?.at(0) || {
        amount: '0',
        denom: 'upokt',
      }),
    },
    {
      type: 'divider',
    },
    {
      type: 'row',
      label: 'Self Delegation',
      value: skeleton || validator?.minSelfDelegation,
    },
    {
      type: 'row',
      label: 'Commission',
      description: (
        <Link href="https://docs.cosmos.network/main/build/modules/distribution#rewards-to-delegators"
              target={'_blank'}
              className={'text-[color:--primary] dark:hover:text-blue-300 hover:text-blue-600 decoration-none whitespace-nowrap overflow-hidden overflow-ellipsis text-xs'}
              prefetch>
          Learn more
        </Link>
      ),
      value: skeleton || formatAmount({
        amount: validator.commission.rate * 100,
        denom: '%',
        maxDecimals: 2,
      }),
    },
    {
      type: 'row',
      label: 'Max. Commission',
      value: skeleton || formatAmount({
        amount: validator.commission.maxRate * 100,
        denom: '%',
        maxDecimals: 2,
      }),
    },
    {
      type: 'row',
      label: 'Max. Change',
      value: skeleton || formatAmount({
        amount: validator.commission.maxChangeRate * 100,
        denom: '%',
        maxDecimals: 4,
      }),
    },
    {
      type: 'divider',
    },
    {
      type: 'row',
      label: 'Moniker',
      value: skeleton || validator.description?.moniker,
    },
    {
      type: 'row',
      label: 'Identity',
      value: skeleton || validator.description?.identity || '-',
    },
    {
      type: 'row',
      label: 'Security Contact',
      value: skeleton || validator.description?.security_contact || '-',
    },
    {
      type: 'row',
      label: 'Details',
      value: skeleton || validator.description?.details || '-',
    },
    {
      type: 'row',
      label: 'Website',
      value: skeleton || validator.description?.website || '-',
    },
  ]

  // @TODO: implement once the Validator lifecycle is handled properly on the indexer.
  // Right now it only handle MsgCreateValidator so, it will never change from staked to unstaking.
  // if (validator.stakeStatus !== 0) {
  //   rows.push({
  //     type: 'divider'
  //   }, {
  //     type: 'row',
  //     label: 'Unstaking Begin At',
  //     value: gateway.unstakingBeginBlock!.height
  //   })
  //
  //   if (gateway.unstakingEndBlock) {
  //     rows.push({
  //       type: 'row',
  //       label: 'Unstaked At Height',
  //       value: gateway.unstakingEndBlock!.height
  //     })
  //   }
  // }

  return rows
}
