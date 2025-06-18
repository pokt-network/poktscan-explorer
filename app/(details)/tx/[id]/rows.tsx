import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Item } from '@/app/components/EntityDetail'
import EntityLink from '@/app/components/EntityLink'
import DateColumn from '@/app/dates/DateColumn'
import DateCellText from '@/app/dates/DateCellText'
import { formatAmount } from '@/app/utils/format'
import { Tx } from '@/app/(details)/tx/[id]/getTx'

export default function getRows(tx: Tx | null, isLoading = false) {
  const skeleton = isLoading ? (
    <Skeleton className={'w-[200px] h-5'} />
  ) : null

  let signerItem: Item

  if (tx?.multisig) {
    signerItem = {
      type: 'row',
      label: 'Signers',
      description: 'Addresses of the signers of the transaction',
      value: (
        <div className={'flex flex-col gap-2 text-sm'}>
          {tx.multisig.all.map((address: string,) => (
            <EntityLink
              key={address}
              entity={'account'}
              entityId={address}
              copy={{
                enabled: true
              }}
            />
          ))}
        </div>
      )
    }
  } else {
    signerItem = {
      type: 'row',
      label: 'Signer',
      description: 'Address of the signer of the transaction',
      value: skeleton ? skeleton : (
        <div className={'text-sm'}>
          <EntityLink
            entity={'account'}
            entityId={tx.signerAddress!}
            copy={{
              enabled: true
            }}
          />
        </div>
      )
    }
  }

  const rows: Array<Item> = [
    signerItem,
    {
      type: 'row',
      label: 'Status',
      value:  skeleton || (
        <div className={'flex flex-row items-center gap-2'}>
          <p className={`text-sm ${tx.code === 0 ? 'text-[color:--success]' : 'text-[color:--error]'} font-semibold`}>
            {tx.code === 0 ? 'Success' : 'Failed'}
          </p>
          {tx.code !== 0 && (
            <div className={'text-sm text-[color:--secondary] bg-[color:--background] border border-[color:--divider] px-4 py-1 rounded-md'}>
              code:{tx.code}
            </div>
          )}
        </div>
      )
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Height',
      value: skeleton ? skeleton : tx.height ? (
        <div className={'text-sm'}>
          <EntityLink
            entity={'block'}
            entityId={tx.height}
            copy={{
              enabled: true
            }}
          />
        </div>
      ) : '-'
    },
    {
      type: 'row',
      label: <DateColumn />,
      value: skeleton ? skeleton : tx.timestamp ? (
        <div className={'text-sm'}>
          <DateCellText value={tx.timestamp} />
        </div>
      ) : '-'
    },
    {
      type: 'divider'
    },
    {
      type: 'row',
      label: 'Gas Used / Wanted',
      value:  skeleton || `${tx.gasUsed} / ${tx.gasWanted}`
    },
    {
      type: 'row',
      label: 'Fee',
      value:  skeleton || formatAmount(tx.fees.find(f => f.denom === 'upokt') || {
        amount: '0',
        denom: 'upokt',
        maxDecimals: 6
      })
    }
  ]

  if (!isLoading && tx.code !== 0) {
    rows.splice(2, 0, ...[
      {
        type: 'row',
        label: 'Code',
        value: tx.code
      },
      {
        type: 'row',
        label: 'Codespace',
        value: tx.codespace
      }
    ] as const)
  }

  if (!isLoading && tx.memo) {
    rows.push({
      type: 'divider'
    },{
      type: 'row',
      label: 'Memo',
      value: (
        <p className={"text-sm text-[color:--foreground] break-all"}>
          {tx.memo}
        </p>
      )
    })
  }

  return rows
}
