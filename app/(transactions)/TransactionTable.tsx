import { Transaction } from '@/app/config/gql/graphql'
import Table, { TableProps } from '@/app/components/Table'
import React from 'react'
import { convertUpoktToPokt, formatAmount } from '@/app/utils/format'
import { graphql } from '@/app/config/gql'
import NewEntitiesFound from '@/app/components/NewEntitiesFound'
import { getTransactionsColumns } from '@/app/(transactions)/columns'

export const transactionsSubscription = graphql(`
  subscription transactions {
    transactions {
      id
      _entity {
        id
        signerAddress
        #        todo: uncomment this when fixed
        #        messages {
        #          nodes {
        #            json
        #          }
        #        }
      }
    }
  }
`)

export interface RowTransaction {
  id: string
  result: number
  codespace?: string
  firstMessage: string
  totalMessages: number
  height: number
  timestamp: string
  amount: string
  fee: string
  signer: string
}

interface TransactionTableProps {
  rawRows: Array<Partial<Transaction>>
  includeSigner?: boolean
  pagination: TableProps['pagination']
  totalItems?: number
  subtitle?: React.ReactNode
  disableSubscription?: boolean
}

export default function TransactionTable({rawRows, includeSigner = true, pagination, totalItems, subtitle, disableSubscription = false}: TransactionTableProps) {
  const rows: Array<RowTransaction> = rawRows.map((transaction) => {
    const fee = transaction.fees!.at(0) || {
      amount: '0',
      denom: 'upokt'
    }

    const amount = transaction.amountSentByDenom?.find(a => a.denom === 'upokt')

    return {
      id: transaction.id || '',
      result: transaction.code,
      codespace: transaction.codespace,
      firstMessage: transaction?.amountOfMessages?.at(0)?.type?.split('.')?.at(-1)?.replace('Msg', '') || '',
      totalMessages: transaction?.amountOfMessages?.reduce((acc, curr) => acc + curr.amount, 0) || 0,
      height: Number(transaction?.block?.height || 0),
      timestamp: transaction?.block?.timestamp || '',
      amount: amount ? formatAmount(amount) : '-',
      raw_amount: amount ? convertUpoktToPokt(amount.amount) : '',
      fee: formatAmount({
        ...fee,
        maxDecimals: 6,
      }),
      raw_fee: convertUpoktToPokt(fee?.amount),
      signer: transaction.signerAddress!,
    } as RowTransaction
  })

  const columns = getTransactionsColumns(includeSigner)

  return (
    <Table
      columns={columns}
      rows={rows}
      header={{
        title: `${totalItems} transactions found`,
        subtitle: subtitle ? subtitle : disableSubscription ? null : (
          // @ts-expect-error tbd
          <NewEntitiesFound<typeof transactionsSubscription>
            entity={'transactions'}
            subscription={transactionsSubscription}
          />
        )
      }}
      pagination={pagination}
    />
  )
}
