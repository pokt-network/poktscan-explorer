import { Item } from '@/app/components/EntityDetail'
import { formatSimpleAmount, formatUpokt } from '@/app/utils/format'
import EntityLink from '@/app/components/EntityLink'
import Link from 'next/link'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Validator } from '@/app/(details)/validator/[id]/getValidator'
import Big from 'big.js'

export default function getRows(validator: Validator | null, isLoading = false) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Status',
      value: skeleton || validator!.status,
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: skeleton || formatUpokt({
        amount: validator!.stakeAmount,
        maxDecimals: 6,
        abbreviateThreshold: Infinity
      }),
    },
    {
      type: 'row',
      label: 'Self Stake',
      value: skeleton || formatUpokt({
        amount: validator!.selfStakeAmount,
        maxDecimals: 6,
        abbreviateThreshold: Infinity
      }),
    },
    {
      type: 'row',
      label: 'Voting Power',
      value: skeleton || validator!.votingPower,
    },
    {
      type: 'row',
      label: 'Commissions',
      value: skeleton || validator!.commissionRewards,
    },
    {
      type: 'row',
      label: 'Outstanding Rewards',
      value: skeleton || validator!.outstandingRewards,
    },
    {
      type: 'divider',
    },
  ]

  if (isLoading || validator?.signer) {
    rows.push({
        type: 'row',
        label: 'Signer',
        description: 'validator signer',
        value: skeleton || (
          <div className={'text-sm'}>
            <EntityLink
              entity={'account'}
              entityId={validator!.signer}
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
        value: skeleton || formatUpokt({
          amount: validator!.balance || 0,
          abbreviateThreshold: Infinity,
          maxDecimals: 6
        }),
      },
      {
        type: 'divider',
      },)
  }

  rows.push(
    {
      type: 'row',
      label: 'Moniker',
      value: skeleton || validator!.moniker,
    },
    {
      type: 'row',
      label: 'Identity',
      value: skeleton || validator?.identity || '-',
    },
    {
      type: 'row',
      label: 'Security Contact',
      value: skeleton || validator?.securityContact || '-',
    },
    {
      type: 'row',
      label: 'Details',
      value: skeleton || validator?.details || '-',
    },
    {
      type: 'row',
      label: 'Website',
      value: skeleton || validator?.website || '-',
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Min Self Delegation',
      value: skeleton || formatSimpleAmount(validator!.minSelfDelegation),
    },
    {
      type: 'row',
      label: 'Commission Rate',
      description: (
        <Link href="https://docs.cosmos.network/main/build/modules/distribution#rewards-to-delegators"
              target={'_blank'}
              className={'text-[color:--primary] dark:hover:text-blue-300 hover:text-blue-600 decoration-none whitespace-nowrap overflow-hidden overflow-ellipsis text-xs'}
              prefetch>
          Learn more
        </Link>
      ),
      value: skeleton || `${formatSimpleAmount(
        new Big(validator!.commission).mul(100).toString()
      )}%`,
    },
    {
      type: 'row',
      label: 'Max. Commission',
      value: skeleton || `${formatSimpleAmount(
        new Big(validator!.maxRate).mul(100).toString()
      )}%`,
    },
    {
      type: 'row',
      label: 'Max. Change',
      value: skeleton || `${formatSimpleAmount(
        new Big(validator!.maxChangeRate).mul(100).toString()
      )}%`,
    },
    {
      type: 'divider',
    },
    {
      type: 'row',
      label: 'Account Address',
      value: skeleton || (
        <div className={'text-sm'}>
          <EntityLink
            entity={'account'}
            entityId={validator!.addresses.account}
            copy={{
              enabled: true,
            }}
          />
        </div>
      ),
    },
    {
      type: 'row',
      label: 'Operator Address',
      value: skeleton || validator!.addresses.operator
    },
    {
      type: 'row',
      label: 'Hex Address',
      value: skeleton || validator!.addresses.hex
    },
    {
      type: 'row',
      label: 'Signer Address',
      value: skeleton || validator!.addresses.consensus
    },
    {
      type: 'row',
      label: 'Consensus Public Key',
      value: skeleton || (
        <p className={'text-xs break-all'}>
          {validator!.addresses.consensusPubkey}
        </p>
      )
    },
  )

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
