'use client'

import useFetchOnBlock, { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { validatorByIdDocument } from '@/app/validator/[id]/operations'
import React, { useMemo } from 'react'
import NotFound from '@/app/not-found'
import EntityDetail, { Item } from '@/app/components/EntityDetail'
import { formatAmount } from '@/app/utils/format'
import { getStakeLabel } from '@/app/utils/stake'
import EntityLink from '@/app/components/EntityLink'
import TitleEntity from '@/app/components/TitleEntity'
import Link from 'next/link'

interface ValidatorDetailProps {
  initialData: DocumentNodeData<typeof validatorByIdDocument>
  id: string
  page: React.ReactNode
}

export default function ValidatorDetail({ id, page, initialData }: ValidatorDetailProps) {
  const variables = useMemo(() => ({ id }), [id])
  const data = useFetchOnBlock({
    query: validatorByIdDocument,
    variables,
    initialResult: initialData,
  })

  if (!data.validator) {
    return (
      <NotFound/>
    )
  }

  const { validator } = data

  const rows: Array<Item> = [
    {
      type: 'row',
      label: 'Address',
      value: validator.id,
    },
    {
      type: 'row',
      label: 'Status',
      value: getStakeLabel(validator.stakeStatus),
    },
    {
      type: 'row',
      label: 'Stake Amount',
      value: formatAmount({
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
      value: (
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
      value: formatAmount(validator.signer?.balances?.nodes?.at(0) || {
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
      value: validator?.minSelfDelegation,
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
      value: formatAmount({
        amount: validator.commission.rate * 100,
        denom: '%',
        maxDecimals: 2,
      }),
    },
    {
      type: 'row',
      label: 'Max. Commission',
      value: formatAmount({
        amount: validator.commission.maxRate * 100,
        denom: '%',
        maxDecimals: 2,
      }),
    },
    {
      type: 'row',
      label: 'Max. Change',
      value: formatAmount({
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
      value: validator.description?.moniker,
    },
    {
      type: 'row',
      label: 'Identity',
      value: validator.description?.identity || '-',
    },
    {
      type: 'row',
      label: 'Security Contact',
      value: validator.description?.security_contact || '-',
    },
    {
      type: 'row',
      label: 'Details',
      value: validator.description?.details || '-',
    },
    {
      type: 'row',
      label: 'Website',
      value: validator.description?.website || '-',
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

  return (
    <div className={'px-3 py-5 md:px-4 gap-4 flex flex-col'}>
      <TitleEntity title={'Validator'} text={validator.id}/>
      <EntityDetail
        items={rows}
      />
      {page}
    </div>
  )
}
