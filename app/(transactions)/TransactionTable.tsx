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
    const sendMessageString = transaction.messages!.nodes.find((msg) => msg!.typeUrl === '/cosmos.bank.v1beta1.MsgSend')

    let sendMessage

    if (sendMessageString && transaction.messages!.nodes.length === 1) {
      sendMessage = JSON.parse(sendMessageString.json!)
    }

    const amount = sendMessage?.amount?.at(0)

    const fee = transaction.fees!.at(0) || {
      amount: '0',
      denom: 'upokt'
    }

    return {
      id: transaction.id || '',
      result: transaction.code,
      codespace: transaction.codespace,
      firstMessage: transaction?.messages?.nodes?.at(0)?.typeUrl?.split('.')?.at(-1)?.replace('Msg', '') || '',
      totalMessages: transaction?.messages?.totalCount || 0,
      height: Number(transaction?.block?.height || 0),
      timestamp: transaction?.block?.timestamp || '',
      amount: amount ? formatAmount(amount) : '-',
      raw_amount: amount ? convertUpoktToPokt(amount.amount) : '',
      fee: formatAmount(fee),
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
